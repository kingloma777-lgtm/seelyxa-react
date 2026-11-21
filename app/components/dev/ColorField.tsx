/**
 * The `color` field type for the dev panel.
 *
 * One row per colour: a swatch that opens the OS picker, the field's label, a
 * HEX box, and a reset back to the manifest default. Every one of the theme's
 * colour fields renders through this single component — the panel only decides
 * which colours exist, never how one is drawn.
 *
 * Dev-only. Styles come from the panel's injected sheet (`sx-*` classes), so
 * this never touches theme CSS or a Salla component.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { normalizeHex, parseHexInput } from '../../lib/devColorFields';

export interface ColorFieldProps {
  label: string;
  /** Shown as the row's tooltip; the panel is dense, so it stays off-screen. */
  description?: string;
  /** `#rrggbb`, or `''` when the field has no colour. */
  value: string;
  /** The manifest default, and what the reset button writes back. */
  fallback: string;
  /** A picked or typed colour; `''` clears the override. */
  onChange: (hex: string) => void;
}

export function ColorField({ label, description, value, fallback, onChange }: ColorFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const editing = useRef(false);
  /** Escape means "put it back": the blur that follows must not commit. */
  const cancelling = useRef(false);

  /* The panel re-renders from its own state on every save, so the box follows
     the value unless the merchant is mid-edit — otherwise a keystroke would be
     replaced by the value that keystroke has not produced yet. */
  useEffect(() => {
    if (!editing.current) setDraft(value);
  }, [value]);

  /** Returns whether the text became a colour (or an intentional clear). */
  const commit = (raw: string): boolean => {
    if (raw.trim() === '') {
      onChange('');
      setInvalid(false);
      return true;
    }
    const hex = parseHexInput(raw);
    if (hex) {
      onChange(hex);
      setInvalid(false);
      return true;
    }
    setInvalid(true);
    return false;
  };

  const dirty = value !== fallback;

  return (
    <div className="sx-row" title={description || undefined}>
      <span className="sx-swatch-wrap">
        <input
          type="color"
          className={`sx-swatch${value ? '' : ' sx-swatch--none'}`}
          aria-label={label}
          value={normalizeHex(value) || '#000000'}
          onChange={(event) => commit(event.target.value)}
        />
        {!value && <span className="sx-swatch-slash" aria-hidden="true" />}
      </span>

      <label className="sx-name" htmlFor={`${id}-hex`}>
        {label}
      </label>

      <input
        id={`${id}-hex`}
        className={`sx-hex${invalid ? ' sx-hex--bad' : ''}`}
        type="text"
        inputMode="text"
        spellCheck={false}
        autoComplete="off"
        dir="ltr"
        placeholder="—"
        value={draft}
        onFocus={() => {
          editing.current = true;
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          if (invalid) setInvalid(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            cancelling.current = true;
            setDraft(value);
            setInvalid(false);
            event.currentTarget.blur();
          }
        }}
        onBlur={() => {
          editing.current = false;
          if (cancelling.current) {
            cancelling.current = false;
            setInvalid(false);
            return;
          }
          /* One commit path: Enter and leaving the box both land here, so a
             rejected value can never linger as text. */
          if (!commit(draft)) setDraft(value);
        }}
      />

      <button
        type="button"
        className="sx-reset"
        disabled={!dirty}
        title={fallback ? `إرجاع إلى ${fallback}` : 'إزالة اللون'}
        aria-label={`إعادة تعيين ${label}`}
        onClick={() => {
          setDraft(fallback);
          setInvalid(false);
          onChange(fallback);
        }}
      >
        ↺
      </button>
    </div>
  );
}

export default ColorField;
