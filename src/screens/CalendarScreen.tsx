import { monthDaysInGrid, monthPrefix, monthTotal, monthTotalUntil, todayKey } from '../calc'
import { formatMoney, WEEKDAYS } from '../format'
import { MonthBar } from '../components/MonthBar'
import type { AppData, MonthCursor } from '../types'

type Props = {
  data: AppData
  cursor: MonthCursor
  selected: string | null
  onCursor: (next: MonthCursor) => void
  onSelect: (key: string) => void
  onOpenDay: (key: string) => void
}

export function CalendarScreen({ data, cursor, selected, onCursor, onSelect, onOpenDay }: Props) {
  const { cells } = monthDaysInGrid(cursor)
  const today = todayKey()
  const prefix = monthPrefix(cursor)
  const selectedEntry = selected ? data.days[selected] : undefined
  const monthSum = monthTotal(data, cursor)
  const untilToday = monthTotalUntil(data, cursor)

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">달력 · 메모</p>
        <MonthBar cursor={cursor} onChange={onCursor} />
      </header>

      <section className="cal-sum">
        <div>
          <span>이달 적은 돈</span>
          <b>{formatMoney(monthSum)}</b>
        </div>
        <div>
          <span>오늘까지 번 돈</span>
          <b>{formatMoney(untilToday)}</b>
        </div>
      </section>

      <div className="cal-week">
        {WEEKDAYS.map((day) => (
          <span key={day} className={day === '일' ? 'is-sun' : ''}>
            {day}
          </span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((day, index) => {
          if (day == null) return <div key={`e-${index}`} className="cal-cell is-empty" />
          const key = `${prefix}${String(day).padStart(2, '0')}`
          const entry = data.days[key]
          const isToday = key === today
          const isSelected = key === selected
          return (
            <button
              key={key}
              type="button"
              className={[
                'cal-cell',
                entry ? 'has-entry' : '',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
              ].join(' ')}
              onClick={() => onSelect(key)}
            >
              <span className="cal-cell__day">{day}</span>
              {entry ? <span className="cal-cell__amt">{formatTiny(entry.amount)}</span> : null}
              {entry?.memo ? <i className="cal-cell__dot" /> : null}
            </button>
          )
        })}
      </div>

      <section className="cal-detail">
        {selected ? (
          <>
            <div>
              <p className="eyebrow">선택한 날</p>
              <strong>{selectedEntry ? formatMoney(selectedEntry.amount) : '아직 없음'}</strong>
              <p>{selectedEntry?.memo || '메모를 적으면 둘이 같이 볼 수 있어요'}</p>
            </div>
            <button type="button" className="btn btn--primary" onClick={() => onOpenDay(selected)}>
              {selectedEntry ? '수정' : '적기'}
            </button>
          </>
        ) : (
          <p className="hint">날짜를 누르면 금액과 메모를 적을 수 있어요.</p>
        )}
      </section>
    </div>
  )
}

function formatTiny(amount: number): string {
  if (amount === 0) return '쉼'
  const man = amount / 10000
  if (amount % 10000 === 0) return `${man}`
  return man.toFixed(1)
}
