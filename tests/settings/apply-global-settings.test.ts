/**
 * The client half of the settings channel.
 *
 * The server writes the merchant's SAVED values onto `<html>` in the first
 * byte, and that is the whole channel a published store needs. It does not
 * cover a value that changes after that byte: the theme editor's live preview
 * merges its state into `theme.settings` on the client only, so a merchant
 * dragging a slider has to see the store move without a reload. That is
 * `applyGlobalSettings`, and this file proves the two properties that make it
 * safe to run on every render:
 *
 *  1. **It writes the same things the server does** — both emitters, no third
 *     copy of the mapping.
 *  2. **It CLEARS what the merchant took back.** This is the failure that
 *     would look like a stuck control: setting a radius and then returning to
 *     "theme" leaves an inline declaration behind, and an inline declaration
 *     out-ranks every stylesheet rule — so the token never comes back.
 *
 * A third property matters just as much and is easy to get wrong: it must not
 * touch inline properties that are not its own. `.app-inner` carries the
 * product-card variables written by `ThemeLayout`; a writer that walked
 * `element.style` and removed every `--*` would wipe them.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  GLOBAL_ATTR_NAMES,
  GLOBAL_VAR_NAMES,
  applyGlobalSettings,
  readGlobalSettings,
} from '../../app/lib/storeSettings';

const root = () => document.documentElement;

beforeEach(() => {
  for (const name of GLOBAL_VAR_NAMES) root().style.removeProperty(name);
  for (const name of GLOBAL_ATTR_NAMES) root().removeAttribute(name);
});

describe('applyGlobalSettings', () => {
  it('writes what the merchant chose', () => {
    applyGlobalSettings(
      readGlobalSettings({
        global_radius: '12',
        global_surface_preset: 'warm',
        global_text_tone: 'warm',
        global_button_height: '48',
      })
    );

    expect(root().style.getPropertyValue('--gs-radius')).toBe('12px');
    expect(root().style.getPropertyValue('--radius-scale')).toBe('0.5455');
    expect(root().style.getPropertyValue('--gs-canvas')).toBe('#faf7f2');
    expect(root().style.getPropertyValue('--gs-canvas-night')).toBe('#17120d');
    expect(root().style.getPropertyValue('--gs-ink-1')).toBe('#2b2519');
    expect(root().style.getPropertyValue('--btn-h')).toBe('48px');
  });

  it('writes the attributes too, not only the custom properties', () => {
    applyGlobalSettings(
      readGlobalSettings({ global_media_radius: 'round', global_card_border: false })
    );
    expect(root().getAttribute('data-gs-media')).toBe('1');
    expect(root().getAttribute('data-gs-card-border')).toBe('off');
  });

  it('clears what the merchant took back, so the token comes back', () => {
    applyGlobalSettings(readGlobalSettings({ global_radius: '12', global_shadow: 'none' }));
    expect(root().style.getPropertyValue('--gs-radius')).toBe('12px');

    // back to "theme" for the radius, still shadow-less
    applyGlobalSettings(readGlobalSettings({ global_shadow: 'none' }));
    expect(root().style.getPropertyValue('--gs-radius')).toBe('');
    expect(root().style.getPropertyValue('--radius-scale')).toBe('');
    // and the property that is still chosen survives
    expect(root().style.getPropertyValue('--shadow-card')).toBe('0 0 #0000');
  });

  it('clears the attributes the same way', () => {
    applyGlobalSettings(readGlobalSettings({ global_reduce_motion: true }));
    expect(root().getAttribute('data-reduce-motion')).toBe('1');

    applyGlobalSettings(readGlobalSettings({}));
    expect(root().hasAttribute('data-reduce-motion')).toBe(false);
  });

  it('an untouched panel leaves the element exactly as the server wrote it', () => {
    /* The server wrote nothing for an untouched panel either, so running the
       client writer over it must be a no-op — not a "reset to defaults" that
       would erase a value the server legitimately set. */
    root().style.setProperty('--pc-radius', '22px');
    applyGlobalSettings(readGlobalSettings({}));
    expect(root().style.getPropertyValue('--gs-radius')).toBe('');
    expect(root().style.getPropertyValue('--pc-radius')).toBe('22px');
  });

  it('never touches an inline property it does not own', () => {
    root().style.setProperty('--pc-bg', '#fdfaf3');
    root().style.setProperty('--unrelated', '42px');

    applyGlobalSettings(readGlobalSettings({ global_radius: '8' }));
    applyGlobalSettings(readGlobalSettings({}));

    expect(root().style.getPropertyValue('--pc-bg')).toBe('#fdfaf3');
    expect(root().style.getPropertyValue('--unrelated')).toBe('42px');
  });

  it('can be pointed at an element other than the root', () => {
    const host = document.createElement('div');
    applyGlobalSettings(readGlobalSettings({ global_gutter: '32' }), host);
    expect(host.style.getPropertyValue('--gs-gutter')).toBe('32px');
    expect(root().style.getPropertyValue('--gs-gutter')).toBe('');
  });
});
