import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Image } from '@salla.sa/twilight-theme-engine/common';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { MorphIco } from './MorphIco';

/**
 * The expanding search — the pill's primary search field, not a trigger.
 *
 * ## Why it is its own component
 *
 * It used to live inside `MorphHeader`, which meant **every keystroke
 * re-rendered the whole header**: the nav (and its magnetic listeners), the
 * fullscreen index, the account takeover, the curtain's props. Measured, that
 * is ~1500 lines of element tree per character typed, for a component whose
 * only consumer of the typed value is the results panel below it.
 *
 * So the expensive state (`term` → the debounced `settled` keyword → the
 * platform query) is owned HERE, and the header keeps only the boolean that
 * its markup actually needs (`.morph-pill--search-open`). Typing now re-renders
 * this subtree and nothing else.
 *
 * ## Why we own the input
 *
 * The platform's `salla-search` in `inline` mode renders a read-only field that
 * opens the engine's own modal, so it can never type in the expanding chip. The
 * theme owns the field and fetches live results through the platform's product
 * API (the same list the search page loads), so behaviour stays native.
 */
export interface SearchLabels {
  search: string;
  placeholder: string;
  loading: string;
  noResults: string;
  all: string;
  recent: string;
  hint: string;
}

const SEARCH_RECENT_KEY = 'morph_recent_searches';
const MAX_RECENT = 6;

function readRecentSearches(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SEARCH_RECENT_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  const next = [trimmed, ...readRecentSearches().filter((s) => s.trim() !== trimmed)]
    .filter(Boolean)
    .slice(0, MAX_RECENT);
  try {
    localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable — the chip simply stays without history */
  }
  return next;
}

export function MorphSearch({
  open,
  onToggle,
  onClose,
  labels,
  icons,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  labels: SearchLabels;
  icons: { search: unknown; close: unknown };
}) {
  const [term, setTerm] = useState('');
  /* live results need the *settled* keyword: 350ms after the last keystroke,
     like the platform widget's own pause */
  const [settled, setSettled] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { format: formatMoney } = useMoney();

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(term.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [term]);

  /* history chips are re-read every open so a term saved in another tab
     shows up too (localStorage is the single source) */
  useEffect(() => {
    if (open) setRecent(readRecentSearches());
  }, [open]);

  /* focus the field once it has finished opening (the chip grows first) */
  useEffect(() => {
    if (!open) return;
    const input = rootRef.current?.querySelector('input');
    const timer = window.setTimeout(() => input?.focus(), 220);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose]);

  const results = useQuery({
    ...product.queries.list({ source: 'search', keyword: settled, perPage: 6 }),
    enabled: open && settled.length >= 2,
  });
  const found = results.data?.items ?? [];
  const typed = term.trim();

  const remember = (value: string) => setRecent(saveRecentSearch(value));

  return (
    <div ref={rootRef} className={`morph-search${open ? ' is-open' : ''}`} data-testid="morph-search">
      {/* `inert`-by-tabindex: collapsed, the field is clipped to a 44px disc with
          `opacity: 0`, so the input is invisible but was still in the tab order —
          a keyboard user tabbed into a control they could not see (measured:
          `tabIndex=0`, `opacity=0`). `-1` takes it out of the sequence without
          touching the open state. `inert` goes further and removes the closed
          subtree from the accessibility tree entirely, which is the part
          `tabIndex` cannot do: the field's child keeps `min-width: 340px`, so
          the box measures 340px (193px of it off-canvas in RTL) and a screen
          reader could still walk into a search field that is not on screen. */}
      <div className="morph-search__field" data-testid="morph-search-field" inert={!open}>
        <input
          type="search"
          className="morph-search__input"
          value={term}
          tabIndex={open ? 0 : -1}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && typed) {
              event.preventDefault();
              remember(typed);
              navigate(`/search?q=${encodeURIComponent(typed)}`);
              onClose();
            }
          }}
          placeholder={labels.placeholder}
          aria-label={labels.search}
          data-testid="morph-search-input"
        />
      </div>
      <button
        type="button"
        className={`morph-search__toggle${open ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls="morph-search-panel"
        aria-label={labels.search}
        onClick={onToggle}
      >
        <MorphIco
          setting={icons.search}
          legacy="search"
          className={`morph-search__glyph morph-search__glyph--open${open ? ' morph-search__glyph--hidden' : ''}`}
        />
        <MorphIco
          setting={icons.close}
          legacy="x"
          className={`morph-search__glyph morph-search__glyph--close${open ? '' : ' morph-search__glyph--hidden'}`}
        />
      </button>

      {/* live results — a sibling panel so the field's clip can't cut it off.
          Idle (empty field) shows the stock search's recent searches as one-tap
          chips, plus a hint while the term is shorter than the platform's own
          two-character minimum. */}
      {open && (
        <div className="morph-search__panel" id="morph-search-panel" data-testid="morph-search-panel">
          {typed.length === 0 && recent.length > 0 && (
            <div className="morph-search__recent">
              <span className="morph-search__recent-label">{labels.recent}</span>
              <div className="morph-search__recent-list">
                {recent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="morph-search__recent-item"
                    onClick={() => setTerm(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          {typed.length < 2 && <p className="morph-search__note">{labels.hint}</p>}
          {typed.length >= 2 && results.isFetching && found.length === 0 && (
            <p className="morph-search__note">{labels.loading}</p>
          )}
          {typed.length >= 2 && !results.isFetching && found.length === 0 && (
            <p className="morph-search__note">{labels.noResults}</p>
          )}
          {typed.length >= 2 && found.length > 0 && (
            <ul className="morph-search__list">
              {found.map((item) => (
                <li key={String(item.id)}>
                  <Link
                    to={item.url || '#'}
                    className="morph-search__result"
                    onClick={() => {
                      remember(typed);
                      onClose();
                    }}
                  >
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.name}
                        width={40}
                        height={40}
                        noWrapper
                        className="morph-search__thumb"
                      />
                    ) : (
                      <span className="morph-search__thumb" aria-hidden="true" />
                    )}
                    <span className="morph-search__result-name">{item.name}</span>
                    <span className="morph-search__result-price">
                      {item.is_on_sale && item.sale_price != null
                        ? formatMoney(item.sale_price)
                        : formatMoney(item.price ?? '')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {typed.length >= 2 && found.length > 0 && (
            <Link
              to={`/search?q=${encodeURIComponent(typed)}`}
              className="morph-search__all"
              onClick={() => {
                remember(typed);
                onClose();
              }}
            >
              {labels.all}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
