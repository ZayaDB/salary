import { calcInsurance, settleMonth } from '../calc'
import { formatMoney, formatMonthTitle } from '../format'
import { InsuranceEditor } from '../components/InsuranceEditor'
import { MonthBar } from '../components/MonthBar'
import type { AppData, MonthCursor } from '../types'

type Props = {
  data: AppData
  cursor: MonthCursor
  onCursor: (next: MonthCursor) => void
  onInsurance: (patch: Pick<AppData, 'rates' | 'insuranceMode' | 'amounts'>) => void
}

export function Settle({ data, cursor, onCursor, onInsurance }: Props) {
  const settle = settleMonth(data, cursor)
  const insurance = calcInsurance(data)

  async function copySummary() {
    const month = formatMonthTitle(cursor.year, cursor.month)
    const lines = [
      `[${month} 월급 정산]`,
      `계약: ${formatMoney(data.contractSalary)}`,
      `이번 달 번 돈: ${formatMoney(settle.actual)}`,
      `4대보험: ${formatMoney(insurance.total)}`,
      `사장님이 주는 기본: ${formatMoney(settle.officialPay)}`,
      settle.extraFromBoss > 0 ? `더 받을 돈: ${formatMoney(settle.extraFromBoss)}` : '',
      settle.returnToBoss > 0 ? `내가 돌려줄 돈: ${formatMoney(settle.returnToBoss)}` : '',
      `최종 내 돈: ${formatMoney(settle.inHand)}`,
    ].filter(Boolean)

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      window.alert('정산 글을 복사했어요. 문자나 카톡에 붙여 넣으면 돼요.')
    } catch {
      window.alert(lines.join('\n'))
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">월급날 계산</p>
        <MonthBar cursor={cursor} onChange={onCursor} />
      </header>

      <section className="story">
        <p>
          사장님이 <b>{formatMoney(settle.officialPay)}</b>을 주고
          {settle.extraFromBoss > 0 ? (
            <>
              , 계약보다 더 번 <b>{formatMoney(settle.extraFromBoss)}</b>을 더 줘요.
            </>
          ) : settle.returnToBoss > 0 ? (
            <>
              , 나는 부족한 <b>{formatMoney(settle.returnToBoss)}</b>을 돌려줘요.
            </>
          ) : (
            <>요. 이번 달은 계약과 같아요.</>
          )}
        </p>
        <p className="story__end">
          그러면 내 손에 <em>{formatMoney(settle.inHand)}</em>이 남아요.
        </p>
      </section>

      <section className="card">
        <p className="section-title">이번 달 숫자</p>
        <div className="rows">
          <div>
            <span>계약 월급</span>
            <b>{formatMoney(data.contractSalary)}</b>
          </div>
          <div>
            <span>실제로 번 돈</span>
            <b>{formatMoney(settle.actual)}</b>
          </div>
          <div className={settle.diff >= 0 ? 'is-plus' : 'is-minus'}>
            <span>계약과 차이</span>
            <b>
              {settle.diff > 0 ? '+' : ''}
              {formatMoney(settle.diff)}
            </b>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="section-title">4대보험 직접 넣기</p>
        <InsuranceEditor data={data} onChange={onInsurance} />
        <div className="rows">
          <div className="is-total">
            <span>보험 합계</span>
            <b>{formatMoney(insurance.total)}</b>
          </div>
        </div>
      </section>

      <button type="button" className="btn btn--primary btn--block" onClick={() => void copySummary()}>
        정산 글 복사하기
      </button>
    </div>
  )
}
