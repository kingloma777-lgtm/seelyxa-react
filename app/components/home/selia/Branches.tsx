import { useRef, useState, type KeyboardEvent } from 'react';
import { readBoolean, readRows, readTextOr, rowText, type BlockData } from '../../../lib/homeBlock';
import { SeliaSection } from './SeliaSection';
import { mapSrc } from './MapLocation';

/**
 * `home.selia-store-branches` — the store's branches, one tab each, with the
 * branch's map under the selected tab.
 *
 * The tabs are a real tablist: `role="tab"` / `aria-selected` / `aria-controls`,
 * arrow keys move between them, and the panel is labelled by its tab. Selia's
 * version is a row of `<div>`s with a click handler — invisible to a keyboard
 * and to a screen reader, on the one block a customer uses to find out whether
 * a shop exists near them.
 *
 * `multiple countries` groups the tabs by a country field. Selia's own switch
 * swaps the whole repeater for a nested one; here the country is an optional
 * field on the same row, so a merchant who turns the switch on does not lose
 * the branches they already typed.
 *
 * Each map is embedded from the branch's pasted code, parsed by the same
 * `mapSrc` the map block uses — see `MapLocation.tsx` for why the raw HTML is
 * never injected.
 */
const PREFIX = 'branches';
const ITEMS = 'branches';

const TAB_STYLES = new Set(['pills', 'underline', 'blocks']);

export function Branches({ data }: { data: BlockData }) {
  const title = readTextOr(data, 'title', PREFIX, '');
  const subtitle = readTextOr(data, 'subtitle', PREFIX, '');
  const style = readTextOr(data, 'tab_style', PREFIX, 'pills');
  const multiCountry = readBoolean(data, 'multi_country', PREFIX, false);
  const fullWidth = readBoolean(data, 'full_width', PREFIX, false);

  const rows = readRows(data, ITEMS, PREFIX)
    .map((row) => ({
      name: rowText(row, 'name', ITEMS),
      country: rowText(row, 'country', ITEMS),
      map: mapSrc(rowText(row, 'map', ITEMS)),
    }))
    .filter((row) => row.name || row.map);

  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  if (!rows.length) return null;

  const index = Math.min(active, rows.length - 1);
  const current = rows[index];
  const tabStyle = TAB_STYLES.has(style) ? style : 'pills';

  // Arrow keys move and activate, Home/End jump to the ends — the ARIA
  // authoring practice for a tablist. Without this the tabs are reachable by
  // Tab but not navigable, which is worse than no tabs at all.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = rows.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  }

  return (
    <SeliaSection title={title} subtitle={subtitle} variant="branches" bleed={fullWidth}>
      <div className={`selia-branches selia-branches--${tabStyle}`}>
        <div className="selia-branches__tabs" role="tablist" onKeyDown={onKeyDown}>
          {rows.map((row, position) => {
            const showCountry =
              multiCountry && row.country && row.country !== rows[position - 1]?.country;
            return (
              <div className="selia-branches__tab-wrap" key={position}>
                {showCountry && <span className="selia-branches__country">{row.country}</span>}
                <button
                  type="button"
                  role="tab"
                  id={`selia-branch-tab-${position}`}
                  aria-selected={position === index}
                  aria-controls="selia-branch-panel"
                  // only the selected tab is in the tab order, so Tab moves
                  // into the panel instead of through every branch
                  tabIndex={position === index ? 0 : -1}
                  ref={(node) => {
                    tabsRef.current[position] = node;
                  }}
                  className={`selia-branches__tab${position === index ? ' is-active' : ''}`}
                  onClick={() => setActive(position)}
                >
                  {row.name || `فرع ${position + 1}`}
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="selia-branches__panel"
          id="selia-branch-panel"
          role="tabpanel"
          aria-labelledby={`selia-branch-tab-${index}`}
        >
          {current.map ? (
            <iframe
              className="selia-branches__map"
              src={current.map}
              title={current.name || 'خريطة الفرع'}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <p className="selia-empty">لم يُضَف كود خريطة لهذا الفرع بعد.</p>
          )}
        </div>
      </div>
    </SeliaSection>
  );
}
