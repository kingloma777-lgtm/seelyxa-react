import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { CloseIcon } from '../icons';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useScrollLock } from '../../hooks/useScrollLock';
import { afterNextPaint } from '../../lib/afterNextPaint';

export interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  /** The dialog's heading. Also names it for screen readers. */
  title: string;
  /** `md` = a single product, `lg` = a grid or a comparison table. */
  size?: 'md' | 'lg';
  /** Extra class on the panel. */
  className?: string;
  /**
   * The panel's content — or a function of `{ mounted }`.
   *
   * The function form exists for content that reads provider hooks the card is
   * allowed to live without (`useMoney` throws outside a `TwilightProvider`,
   * and a card is a leaf that can be rendered in a unit test or an editor
   * preview). Mounting that content only while the panel is on screen keeps
   * the card itself provider-free — and because `mounted` outlives `open` by
   * the exit transition, the panel never empties out while it slides away.
   */
  children: ReactNode | ((state: { mounted: boolean }) => ReactNode);
}

/** Matches the transition duration in `04-components/product-actions.scss`. */
const TRANSITION_MS = 260;

/**
 * The product card's dialog: a centred panel on a desktop, a bottom sheet on a
 * phone — one surface for quick view, similar products and the comparison, so
 * three overlays cannot disagree about the scrim, the radius or the way out.
 *
 * Why not the engine's `Modal`: it ships its own Tailwind face, and the card's
 * dialogs have to inherit the store's `--surface-*` / `--ink-*` / `--radius-*`
 * roles like every other surface in the theme. Why not `BottomSheet`: that one
 * is bottom-anchored at every width, and a quick view on a 1440px screen wants
 * to be a panel, not a strip along the floor.
 *
 * The motion is the theme's usual contract: `mounted` keeps the panel in the
 * tree through the exit, and the open class is flipped only after a forced
 * reflow so the closed transform always has a starting frame.
 */
export function ProductDialog({
  open,
  onClose,
  title,
  size = 'md',
  className,
  children,
}: ProductDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    setEntered(false);
    const unmount = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(unmount);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    void panelRef.current?.offsetWidth;
    return afterNextPaint(() => setEntered(true));
  }, [mounted, open]);

  /* Focus the panel, not its first control: the first control is the close
     button, and a ring painted on ✕ every time the panel opens reads as an
     error the customer did not make. */
  useDialogFocus(panelRef, mounted && entered, 'container');

  const onCloseEvent = useEffectEvent(onClose);
  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseEvent();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`pc-dialog-root${entered ? ' is-open' : ''}`}
      // `useDialogFocus` traps Tab and Escape closes the panel, which is what
      // the rule asks <dialog> for: see .react-doctor/false-positives.md.
      // react-doctor-disable-next-line react-doctor/prefer-html-dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="pc-dialog__backdrop" role="presentation" onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`pc-dialog pc-dialog--${size}${className ? ` ${className}` : ''}`}
      >
        <div className="pc-dialog__head">
          <h2 className="pc-dialog__title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="pc-dialog__close"
            aria-label={t('common.actions.close', 'إغلاق')}
            onClick={onClose}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>

        <div className="pc-dialog__body">
          {typeof children === 'function' ? children({ mounted }) : children}
        </div>
      </div>
    </div>,
    document.body
  );
}
