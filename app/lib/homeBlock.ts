import { useEffect, useRef, type RefObject } from 'react';
import { imgSrc, rowsFrom, scalar } from './curtainSlots';

export type BlockData = Record<string, unknown>;
export type BlockRow = Record<string, unknown>;

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

/** Top-level settings arrive short (`title`) or prefixed (`block_title`). */
export function readValue(data: BlockData | undefined, key: string, prefix: string): unknown {
  if (!data) return undefined;
  if (data[key] !== undefined && data[key] !== null) return data[key];
  return data[`${prefix}_${key}`] ?? data[`${prefix}.${key}`];
}

export function readText(
  data: BlockData | undefined,
  key: string,
  prefix: string,
  fallback = ''
): string {
  return scalar(readValue(data, key, prefix)) || fallback;
}

export function readNumber(
  data: BlockData | undefined,
  key: string,
  prefix: string,
  fallback: number
): number {
  const value = Number(scalar(readValue(data, key, prefix)));
  return Number.isFinite(value) ? value : fallback;
}

export function readBoolean(
  data: BlockData | undefined,
  key: string,
  prefix: string,
  fallback = false
): boolean {
  const value = readValue(data, key, prefix);
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function readRows(
  data: BlockData | undefined,
  key: string,
  prefix: string
): BlockRow[] {
  return rowsFrom(readValue(data, key, prefix));
}

export function rowValue(row: BlockRow, key: string, prefix: string): unknown {
  if (row[key] !== undefined && row[key] !== null) return row[key];
  return row[`${prefix}.${key}`] ?? row[`${prefix}_${key}`];
}

export function rowText(row: BlockRow, key: string, prefix: string, fallback = ''): string {
  return scalar(rowValue(row, key, prefix)) || fallback;
}

export function rowImage(row: BlockRow, key: string, prefix: string, fallback = ''): string {
  return imgSrc(rowValue(row, key, prefix)) || fallback;
}

export function rowLink(row: BlockRow, key: string, prefix: string): string {
  const value = rowValue(row, key, prefix);
  if (typeof value === 'string') return value;
  return scalar(value);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Tracks a scoped block's scroll progress without React state (0 → 1). */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress?: (progress: number) => void
) {
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      element.style.setProperty('--block-progress', progress.toFixed(4));
      callback.current?.(progress);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/** Adds `.is-visible` to `[data-reveal]` descendants when they enter view. */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ref]);
}

/** Shared class names for the arrow buttons used by the carousels. */
export const arrowLabel = (direction: 'previous' | 'next') =>
  direction === 'previous' ? 'Previous' : 'Next';
