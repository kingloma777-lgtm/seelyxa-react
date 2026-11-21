import { memo, useRef } from 'react';
import {
  readBoolean,
  readRows,
  readTextOr,
  rowText,
  rowValue,
  useReveal,
  type BlockData,
} from '../../../lib/homeBlock';
import { scalar } from '../../../lib/curtainSlots';
import { SeliaSection } from './SeliaSection';
import { useCountUp } from './useCountUp';

/**
 * `home.selia-statistics` — the strip of big figures with a line under each.
 *
 * Selia's version is one repeating row: icon, colour, number, title, blurb.
 * Ported as-is, with two corrections:
 *
 *  - **The colour is an accent, not a fill.** Selia paints the icon square and
 *    the number in the merchant's colour. On a dark page a `#004956` number is
 *    nearly invisible, so the number keeps the page's ink and only the icon
 *    square carries the accent (tinted, not solid). The block stays readable
 *    whichever colour the merchant picks. A short hairline under the figure
 *    echoes the same colour, so the row still reads as a family of accents
 *    without the number itself depending on one.
 *  - **The counter degrades honestly.** `useCountUp` returns the merchant's
 *    exact text when the animation is off, when the value has no digits, or
 *    when the visitor asked for reduced motion — see that hook for why.
 *  - **The strip arrives as a sequence, not a wall.** Each card reveals on
 *    entering the viewport with a small per-index delay, through the shared
 *    `useReveal` helper (`[data-reveal]` → `.is-visible`). Reduced motion
 *    skips straight to the settled row.
 *
 * The number is rendered inside a `dir="ltr"` span: `+1,200` and `%٩٩` are
 * *figures*, and in an RTL paragraph the bidi algorithm happily moves a leading
 * `+` to the other end. The number is the one thing on the page that must not
 * follow the reading direction.
 */
const PREFIX = 'statistics';
const ITEMS = 'stats';

interface StatRowProps {
  order: number;
  number: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  countUp: boolean;
}

function StatRow({ order, number, title, description, icon, color, countUp }: StatRowProps) {
  const { ref, display } = useCountUp(number, countUp);
  const iconClass = icon ? (icon.startsWith('sicon-') ? icon : `sicon-${icon}`) : '';

  return (
    <li
      className="selia-stats__item"
      data-reveal
      style={
        {
          '--stat-color': color || undefined,
          /* the entrance stagger reads this, so the row arrives as a sequence */
          '--reveal-i': order,
        } as React.CSSProperties
      }
    >
      {iconClass && (
        <span className="selia-stats__icon" aria-hidden="true">
          <i className={iconClass} />
        </span>
      )}
      <span className="selia-stats__number" dir="ltr" ref={ref}>
        {display}
      </span>
      <span className="selia-stats__rule" aria-hidden="true" />
      {title && <span className="selia-stats__label">{title}</span>}
      {description && <p className="selia-stats__desc">{description}</p>}
    </li>
  );
}

export const Statistics = memo(function Statistics({ data }: { data: BlockData }) {
  const rows = readRows(data, ITEMS, PREFIX);
  const title = readTextOr(data, 'title', PREFIX, '');
  const subtitle = readTextOr(data, 'subtitle', PREFIX, '');
  const countUp = readBoolean(data, 'count_up', PREFIX, true);
  const listRef = useRef<HTMLUListElement>(null);
  useReveal(listRef);

  if (!rows.length) return null;

  return (
    <SeliaSection title={title} subtitle={subtitle} variant="stats" align="center">
      <ul className="selia-stats" ref={listRef}>
        {rows.map((row, index) => (
          <StatRow
            key={index}
            order={index}
            number={rowText(row, 'number', ITEMS)}
            title={rowText(row, 'title', ITEMS)}
            description={rowText(row, 'description', ITEMS)}
            icon={rowText(row, 'icon', ITEMS)}
            color={scalar(rowValue(row, 'color', ITEMS))}
            countUp={countUp}
          />
        ))}
      </ul>
    </SeliaSection>
  );
});
