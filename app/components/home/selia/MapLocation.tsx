import { memo } from 'react';
import { readBoolean, readTextOr, type BlockData } from '../../../lib/homeBlock';
import { SeliaSection } from './SeliaSection';

/**
 * `home.selia-map-location` — the store's location, embedded.
 *
 * Selia's field is a textarea the merchant pastes a Google Maps *share embed*
 * into, and Selia drops that string into the page with `innerHTML`. Two things
 * are wrong with that, and this port fixes both:
 *
 *  - **Arbitrary HTML in the page.** A textarea whose contents reach
 *    `innerHTML` is a hole that runs whatever is pasted into it — `<script>`,
 *    an `onerror` handler, a form that posts the visitor's session elsewhere.
 *    Here the pasted string is only ever *read*: the `src` of its `<iframe>`
 *    is pulled out and rendered as our own `<iframe>`. Everything else the
 *    merchant pasted is discarded, so there is nothing to execute.
 *  - **A non-https or `javascript:` src.** Only an `https:` URL is accepted;
 *    anything else renders nothing rather than an empty frame or a redirect.
 *
 * The dark toggle inverts the map rather than asking Google for a dark style —
 * the embed API has no dark parameter, and an inverted map is the same map,
 * legibly. It is applied only when the merchant asks for it, because an
 * inverted map on a light page looks broken.
 *
 * The frame is lazy: a map is a third-party request and a lot of layout, and
 * most visitors scroll past it. `aspect-ratio` reserves the space so the
 * arrival of the map cannot shove the page down.
 */

/** The `src` of the pasted embed, or the bare URL if that is what they pasted. */
export function mapSrc(value: string): string {
  const raw = (value || '').trim();
  if (!raw) return '';

  const fromIframe = raw.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
  const candidate = (fromIframe?.[1] || (raw.startsWith('http') ? raw : '')).trim();
  if (!candidate) return '';

  // Only https. A `javascript:` src on an iframe is inert in every current
  // browser, but it is not worth relying on, and a relative src would silently
  // point at the store's own origin.
  if (!/^https:\/\//i.test(candidate)) return '';

  return candidate.replace(/"/g, '%22');
}

export const MapLocation = memo(function MapLocation({ data }: { data: BlockData }) {
  const title = readTextOr(data, 'title', 'map', '');
  const subtitle = readTextOr(data, 'subtitle', 'map', '');
  const src = mapSrc(readTextOr(data, 'embed', 'map', ''));
  const dark = readBoolean(data, 'dark_mode', 'map', false);

  if (!src) return null;

  return (
    <SeliaSection title={title} subtitle={subtitle} variant="map">
      <div className={`selia-map${dark ? ' selia-map--dark' : ''}`}>
        <iframe
          className="selia-map__frame"
          src={src}
          title={title || 'خريطة الموقع'}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </SeliaSection>
  );
});
