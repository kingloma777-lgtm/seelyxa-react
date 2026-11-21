/**
 * One colour mode, two inputs, one painter.
 *
 * The theme has always painted night with the `dark` class on `<html>` (see
 * `01-settings/global.scss`). Salla paints a *different* switch of its own:
 * `color-mode-dark` / `color-mode-light` on `<body>`, derived from the
 * merchant's dashboard choice (`theme.color.is_dark`). Two switches, no
 * arbitration — so a merchant who picks dark in the dashboard got a light
 * storefront, and the theme's own toggle contradicted the dashboard silently.
 *
 * The rule below is the whole policy, and it is deliberately the smallest one
 * that cannot surprise an existing store:
 *
 *   1. the visitor's saved choice, when there is one  (unchanged behaviour)
 *   2. the merchant's dashboard choice                (new: was ignored)
 *   3. light                                          (the theme's default)
 *
 * Only `html.dark` ever paints. `color-mode-*` stays what it is — the engine's
 * body class — and is read as an INPUT, never as a second renderer. That is the
 * one thing this module exists to prevent: two systems deciding the same
 * surface.
 *
 * `localStorage` is the same key the header's toggle has always written, so no
 * visitor loses the preference they already saved.
 */

export type ColorMode = 'light' | 'dark';

/** The key the header toggle writes. Kept verbatim: changing it would silently
 *  reset every visitor who ever pressed the button. */
export const COLOR_MODE_STORAGE_KEY = 'seelyxa-theme';

export interface ColorModeInput {
  /** What the visitor last chose — `null`/`undefined`/anything else = no choice. */
  saved?: string | null;
  /** The merchant's dashboard choice (`theme.color.is_dark`). */
  merchantDark?: boolean;
}

/** Pure: no DOM, no storage. This is the part the tests pin. */
export function resolveColorMode({ saved, merchantDark }: ColorModeInput): ColorMode {
  if (saved === 'dark' || saved === 'light') return saved;
  return merchantDark === true ? 'dark' : 'light';
}

/** The visitor's saved choice, or `null`. Storage can throw (private mode,
 *  blocked cookies) — a store must never fail to render over a preference. */
export function readSavedColorMode(): ColorMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

/**
 * The only writer. Adds/removes the class the stylesheet reads — and mirrors
 * it onto the engine's own switch.
 *
 * WHY BOTH SWITCHES
 * -----------------
 * `html.dark` is what THIS theme paints from. `body.color-mode-*` is what
 * Salla's embedded components (`<salla-*>`, the login iframe shell, the
 * checkout widgets) read, and the engine writes it once from the merchant's
 * dashboard choice (`themeBodyClasses` in the provider). A visitor who flips
 * the moon button therefore got a dark storefront with light embedded widgets —
 * the disagreement this module exists to prevent, just moved one level down.
 *
 * The engine only ever `classList.add`s, so the mirror has to REMOVE the other
 * value: adding `color-mode-dark` beside a stale `color-mode-light` leaves both
 * classes on `<body>` and the last stylesheet wins by source order, not by
 * intent. Same key, same single writer, both switches.
 */
export function applyColorMode(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  const body = document.body;
  if (!body) return;
  body.classList.remove('color-mode-dark', 'color-mode-light');
  body.classList.add(`color-mode-${mode}`);
}

/**
 * The boot script, inlined in `<head>` before the first paint.
 *
 * It has to be a string (it runs before React), and it has to be tiny: this is
 * on the critical path of every page. `data-color-mode` is the merchant's
 * choice rendered by the server, so the script never needs the settings payload
 * — it only has to let a saved visitor choice win.
 */
export const COLOR_MODE_BOOT_SCRIPT = `(function(){try{var r=document.documentElement;var s=null;try{s=localStorage.getItem('${COLOR_MODE_STORAGE_KEY}');}catch(e){}var m=(s==='dark'||s==='light')?s:(r.getAttribute('data-color-mode')||'light');if(m==='dark')r.classList.add('dark');var f=function(){var b=document.body;if(!b)return;b.classList.remove('color-mode-dark','color-mode-light');b.classList.add('color-mode-'+m);};f();document.addEventListener('DOMContentLoaded',f);}catch(e){}})();`;
