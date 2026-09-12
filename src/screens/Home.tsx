import { isSameMonth, settleMonth, todayKey } from '../calc'
import { formatMan, formatMoney, formatShortDay } from '../format'
import { MonthBar } from '../components/MonthBar'
import type { AppData, MonthCursor } from '../types'

type Props = {
  data: AppData
  cursor: MonthCursor
  onCursor: (next: MonthCursor) => void
  onOpenDay: (key: string) => void
}

export function Home({ data, cursor, onCursor, onOpenDay }: Props) {
  const settle = settleMonth(data, cursor)
  const today = todayKey()
  const todayEntry = data.days[today]
  const thisMonth = isSameMonth(cursor)
  const progress = data.contractSalary > 0 ? Math.min(settle.actual / data.contractSalary, 1) : 0
  const remain = data.contractSalary - settle.actual

  const recent = Object.entries(data.days)
    .filter(([key]) => key.startsWith(`${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-`))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="eyebrow">월급 장부 · {data.roomId}</p>
          <MonthBar cursor={cursor} onChange={onCursor} />
        </div>
      </header>

      <section className="hero">
        <p className="hero__label">이번 달 번 돈</p>
        <p className="hero__value">{formatMoney(settle.actual)}</p>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="hero__note">
          계약 {formatMan(data.contractSalary)} 원
          {remain > 0
            ? ` · 아직 ${formatMoney(remain)} 남음`
            : remain < 0
              ? ` · 계약보다 ${formatMoney(-remain)} 더 벌었어요`
              : ' · 계약과 같아요'}
        </p>
      </section>

      {thisMonth ? (
        <button type="button" className="today-card" onClick={() => onOpenDay(today)}>
          <div>
            <p className="eyebrow">오늘</p>
            {todayEntry ? (
              <>
                <strong>{formatMoney(todayEntry.amount)}</strong>
                <span>{todayEntry.memo || '메모 없음 · 눌러서 수정'}</span>
              </>
            ) : (
              <>
                <strong>오늘 금액 적기</strong>
                <span>사장님 문자 오면 여기 눌러서 넣어요</span>
              </>
            )}
          </div>
          <span className="today-card__go">적기</span>
        </button>
      ) : (
        <p className="hint">지난달·다음달을 보고 있어요. 오늘 금액은 이번 달로 돌아가면 적을 수 있어요.</p>
      )}

      <section className="preview">
        <p className="section-title">월급날 미리보기</p>
        <div className="rows">
          <div>
            <span>4대보험</span>
            <b>{formatMoney(settle.insurance.total)}</b>
          </div>
          <div>
            <span>사장님이 주는 기본</span>
            <b>{formatMoney(settle.officialPay)}</b>
          </div>
          {settle.extraFromBoss > 0 ? (
            <div className="is-plus">
              <span>더 받을 돈</span>
              <b>+{formatMoney(settle.extraFromBoss)}</b>
            </div>
          ) : null}
          {settle.returnToBoss > 0 ? (
            <div className="is-minus">
              <span>내가 돌려줄 돈</span>
              <b>-{formatMoney(settle.returnToBoss)}</b>
            </div>
          ) : null}
          <div className="is-total">
            <span>내 손에 남을 돈</span>
            <b>{formatMoney(settle.inHand)}</b>
          </div>
        </div>
      </section>

      <section>
        <p className="section-title">이번 달 기록 {settle.enteredDays}일</p>
        {recent.length === 0 ? (
          <p className="empty">아직 적은 날이 없어요. 달력에서 하루를 눌러 보세요.</p>
        ) : (
          <ul className="day-list">
            {recent.map(([key, entry]) => (
              <li key={key}>
                <button type="button" onClick={() => onOpenDay(key)}>
                  <em>{formatShortDay(key)}</em>
                  <span>{entry.memo || '메모 없음'}</span>
                  <b>{formatMoney(entry.amount)}</b>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
