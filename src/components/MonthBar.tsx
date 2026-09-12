import { formatMonthTitle } from '../format'
import { shiftMonth } from '../calc'
import type { MonthCursor } from '../types'

type Props = {
  cursor: MonthCursor
  onChange: (next: MonthCursor) => void
}

export function MonthBar({ cursor, onChange }: Props) {
  return (
    <div className="month-bar">
      <button
        type="button"
        className="icon-btn"
        aria-label="지난달"
        onClick={() => onChange(shiftMonth(cursor, -1))}
      >
        <Chevron dir="left" />
      </button>
      <p className="month-bar__title">{formatMonthTitle(cursor.year, cursor.month)}</p>
      <button
        type="button"
        className="icon-btn"
        aria-label="다음달"
        onClick={() => onChange(shiftMonth(cursor, 1))}
      >
        <Chevron dir="right" />
      </button>
    </div>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M14.5 6 8.5 12l6 6' : 'M9.5 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
