import { MorphHeader } from './MorphHeader';

/**
 * The storefront header. There is exactly one layout — MorphPill — so this is
 * a named wrapper around {@link MorphHeader} rather than a switch.
 *
 * History: the theme used to ship three layouts (`lite`, `default`, `morph`)
 * picked through the `header_layout` theme setting. The two engine-shaped ones
 * were removed from the customization settings, and with them
 * `HeaderTopnav` / `HeaderMainMenu` / `HeaderNav` and their stylesheet. The
 * wrapper stays because `ThemeLayout` (and the tests) import `Header`, and
 * because a store still holding `header_layout: "lite"` or `"default"` must
 * land on the morph header instead of a blank bar.
 *
 * The morph header owns its own pill, overlay, search, mega-menu and mobile
 * index; styling lives in `styles/04-components/morph-header.scss`, with the
 * first-paint subset in `styles/morph-critical.scss`.
 */
export function Header() {
  return <MorphHeader />;
}
