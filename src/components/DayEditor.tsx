import { useEffect, useState } from 'react'
import { formatDayTitle } from '../format'
import type { DayEntry } from '../types'

const QUICK_MAN = [5, 10, 15, 20, 25, 30]

type Props = {
  dayKey: string
  entry?: DayEntry
  onClose: () => void
  onSave: (entry: DayEntry) => void
  onDelete: () => void
}

function splitAmount(amount: number): { unit: 'man' | 'won'; value: string } {
  if (amount === 0) return { unit: 'man', value: '0' }
  if (amount % 10000 === 0) return { unit: 'man', value: String(amount / 10000) }
  return { unit: 'won', value: String(amount) }
}

function toWon(unit: 'man' | 'won', raw: string): number | null {
  const value = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(value) || value < 0) return null
  return unit === 'man' ? Math.round(value * 10000) : Math.round(value)
}

export function DayEditor({ dayKey, entry, onClose, onSave, onDelete }: Props) {
  const initial = splitAmount(entry?.amount ?? 0)
  const [unit, setUnit] = useState<'man' | 'won'>(entry ? initial.unit : 'man')
  const [value, setValue] = useState(entry ? initial.value : '')
  const [memo, setMemo] = useState(entry?.memo ?? '')

  useEffect(() => {
    const next = splitAmount(entry?.amount ?? 0)
    setUnit(entry ? next.unit : 'man')
    setValue(entry ? next.value : '')
    setMemo(entry?.memo ?? '')
  }, [dayKey, entry])

  function commit(nextAmount?: number, nextMemo = memo) {
    const amount = nextAmount ?? toWon(unit, value)
    if (amount == null) return
    onSave({ amount, memo: nextMemo.trim() })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="sheet"
        role="dialog"
        aria-labelledby="day-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__handle" />
        <header className="sheet__head">
          <div>
            <p className="eyebrow">하루 기록</p>
            <h2 id="day-editor-title">{formatDayTitle(dayKey)}</h2>
          </div>
          <button type="button" className="text-btn" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="unit-toggle" role="tablist" aria-label="금액 단위">
          <button
            type="button"
            className={unit === 'man' ? 'is-on' : ''}
            onClick={() => {
              const won = toWon(unit, value)
              setUnit('man')
              if (won != null && won % 10000 === 0) setValue(String(won / 10000))
              else if (won != null) setValue(String(won / 10000))
            }}
          >
            만원
          </button>
          <button
            type="button"
            className={unit === 'won' ? 'is-on' : ''}
            onClick={() => {
              const won = toWon(unit, value)
              setUnit('won')
              if (won != null) setValue(String(won))
            }}
          >
            원
          </button>
        </div>

        <label className="field">
          <span>오늘 사장님이 말한 금액</span>
          <input
            inputMode="decimal"
            value={value}
            placeholder={unit === 'man' ? '예: 18' : '예: 180000'}
            onChange={(event) => setValue(event.target.value)}
          />
          <small>{unit === 'man' ? '18 이라고 쓰면 18만 원이에요' : '원 단위로 그대로 저장해요'}</small>
        </label>

        <div className="chips">
          {QUICK_MAN.map((man) => (
            <button
              key={man}
              type="button"
              className="chip"
              onClick={() => {
                setUnit('man')
                setValue(String(man))
              }}
            >
              {man}만
            </button>
          ))}
          <button
            type="button"
            className="chip chip--ghost"
            onClick={() => {
              setUnit('man')
              setValue('0')
              setMemo((prev) => prev || '쉬는 날')
            }}
          >
            쉬는 날
          </button>
        </div>

        <label className="field">
          <span>메모</span>
          <textarea
            rows={3}
            value={memo}
            placeholder="사장님 문자, 출입국 일정, 약속…"
            onChange={(event) => setMemo(event.target.value)}
          />
        </label>

        <div className="sheet__actions">
          {entry ? (
            <button type="button" className="btn btn--ghost" onClick={onDelete}>
              지우기
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn btn--primary" onClick={() => commit()}>
            저장
          </button>
        </div>
      </section>
    </div>
  )
}
