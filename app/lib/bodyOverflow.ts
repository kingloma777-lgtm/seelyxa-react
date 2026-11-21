/**
 * Reference-counted `body.style.overflow` lock.
 *
 * The MorphPill header has two fullscreen surfaces that can be open at the
 * same time (the burger index and the account takeover). Each used to write
 * the same inline property independently: whichever one closed last unlocked
 * the page while the other was still open. Counting the locks — and restoring
 * the value that was there before the first one — keeps the two in agreement
 * without changing the inline contract the header tests and the first paint
 * rely on.
 */
let locks = 0;
let previous = '';
const LOCK_CLASS = 'body-scroll-locked';

export function lockBodyOverflow(): void {
  if (locks === 0) {
    previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // `html` reserves a stable scrollbar gutter so the page never jumps when
    // a modal opens. While scrolling is locked that gutter is empty and would
    // otherwise show the white canvas as a strip beside the overlay. Marking
    // the root lets CSS paint it as part of the overlay instead.
    document.documentElement.classList.add(LOCK_CLASS);
  }
  locks += 1;
}

export function unlockBodyOverflow(): void {
  if (locks === 0) return;
  locks -= 1;
  if (locks === 0) {
    document.body.style.overflow = previous;
    document.documentElement.classList.remove(LOCK_CLASS);
  }
}
