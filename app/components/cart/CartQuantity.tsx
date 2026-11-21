import { useCallback, useEffect, useRef, useState } from 'react';
import { MinusIcon, PlusIcon } from '../icons';

/**
 * Plain-React quantity stepper — the `<salla-quantity-input>` web component
 * (deferred or Core) either stuck on its skeleton or never wired its buttons
 * here, so the pill (`.s-quantity-input-*`, styled in `quantity-stepper.scss`)
 * is rebuilt in React and the change is pushed straight to `salla.cart`.
 *
 * Shared by the cart page's `CartItem` row and the cart drawer, so both post
 * the same debounced value and revert the same way.
 */
export function CartQuantity({
  value,
  max,
  label,
  disabled = false,
  onChange,
}: {
  value: number;
  max?: number;
  label: string;
  /** Row is being removed — freeze the stepper and drop any pending commit. */
  disabled?: boolean;
  onChange: (quantity: number) => Promise<void>;
}) {
  const [qty, setQty] = useState(value);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // follow a server-corrected quantity on refetch, but not while the user is
  // mid-edit (a stale refetch would otherwise snap the number back)
  useEffect(() => {
    if (!pending.current) setQty(value);
  }, [value]);

  // Never let a debounced commit fire after the row is gone (deleted mid-edit)
  // or once it's being deleted — it would `updateItem` a stale / removed id.
  useEffect(() => {
    if (disabled) {
      clearTimeout(timer.current);
      pending.current = false;
    }
  }, [disabled]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = useCallback(
    (next: number) => {
      const clamped = Math.max(1, max ? Math.min(next, max) : next);
      setQty(clamped);
      pending.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pending.current = false;
        // Revert to the server-confirmed `value`, not the locally-optimistic
        // chain — a failed update never changes it, and mid-burst edits (e.g.
        // 3 -> 4 before 2 -> 3 ever committed) would otherwise roll back to
        // an unconfirmed intermediate quantity instead of the real one.
        onChange(clamped).catch(() => setQty(value));
      }, 350);
    },
    [max, onChange, value]
  );

  return (
    <div className="s-quantity-input">
      <div className="s-quantity-input-container">
        <button
          type="button"
          className="s-quantity-input-increase-button s-quantity-input-button"
          aria-label={`${label} +`}
          disabled={disabled || (!!max && qty >= max)}
          onClick={() => commit(qty + 1)}
        >
          <PlusIcon aria-hidden="true" />
        </button>
        <input
          className="s-quantity-input-input"
          name="quantity"
          inputMode="numeric"
          aria-label={label}
          value={qty}
          disabled={disabled}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
            commit(Number.isFinite(n) ? n : 1);
          }}
        />
        <button
          type="button"
          className="s-quantity-input-decrease-button s-quantity-input-button"
          aria-label={`${label} -`}
          disabled={disabled || qty <= 1}
          onClick={() => commit(qty - 1)}
        >
          <MinusIcon aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
