import { useEffect, useState } from 'react'
import { calcInsuranceFromRates } from '../calc'
import { formatMoney } from '../format'
import { DEFAULT_RATES } from '../storage'
import type { AppData, InsuranceAmounts, InsuranceKey, InsuranceMode, InsuranceRates } from '../types'

const FIELDS: Array<{ key: InsuranceKey; label: string; rateHint: string }> = [
  { key: 'pension', label: '국민연금', rateHint: '월급의 %' },
  { key: 'health', label: '건강보험', rateHint: '월급의 %' },
  { key: 'longTermCare', label: '장기요양', rateHint: '건보료의 %' },
  { key: 'employment', label: '고용보험', rateHint: '월급의 %' },
]

type Props = {
  data: AppData
  onChange: (patch: Pick<AppData, 'rates' | 'insuranceMode' | 'amounts'>) => void
}

function asText(values: InsuranceRates | InsuranceAmounts) {
  return {
    pension: String(values.pension),
    health: String(values.health),
    longTermCare: String(values.longTermCare),
    employment: String(values.employment),
  }
}

function parseFour(text: Record<InsuranceKey, string>): InsuranceRates | null {
  const next = {
    pension: Number(text.pension),
    health: Number(text.health),
    longTermCare: Number(text.longTermCare),
    employment: Number(text.employment),
  }
  if (Object.values(next).some((value) => !Number.isFinite(value) || value < 0)) return null
  return next
}

export function InsuranceEditor({ data, onChange }: Props) {
  const [rateText, setRateText] = useState(asText(data.rates))
  const [amountText, setAmountText] = useState(asText(data.amounts))
  const computed = calcInsuranceFromRates(data.contractSalary, data.rates)
  const mode = data.insuranceMode

  useEffect(() => {
    setRateText(asText(data.rates))
    setAmountText(asText(data.amounts))
  }, [data.rates, data.amounts])

  function setMode(next: InsuranceMode) {
    if (next === 'amount') {
      const seed = data.insuranceMode === 'amount' ? data.amounts : computed
      const amounts = {
        pension: seed.pension,
        health: seed.health,
        longTermCare: seed.longTermCare,
        employment: seed.employment,
      }
      setAmountText(asText(amounts))
      onChange({ rates: data.rates, insuranceMode: 'amount', amounts })
      return
    }
    onChange({ rates: data.rates, insuranceMode: 'rate', amounts: data.amounts })
  }

  function saveRates(nextText = rateText) {
    const rates = parseFour(nextText)
    if (!rates) return
    onChange({ rates, insuranceMode: data.insuranceMode, amounts: data.amounts })
  }

  function saveAmounts(nextText = amountText) {
    const amounts = parseFour(nextText)
    if (!amounts) return
    onChange({ rates: data.rates, insuranceMode: 'amount', amounts })
  }

  return (
    <div className="ins-editor">
      <div className="unit-toggle" role="tablist" aria-label="4대보험 입력 방법">
        <button type="button" className={mode === 'rate' ? 'is-on' : ''} onClick={() => setMode('rate')}>
          비율로 계산
        </button>
        <button type="button" className={mode === 'amount' ? 'is-on' : ''} onClick={() => setMode('amount')}>
          금액 직접 적기
        </button>
      </div>

      <p className="hint">
        {mode === 'rate'
          ? '고지서에 나온 퍼센트를 넣으면 계약 월급 기준으로 계산해요.'
          : '사장님이나 고지서에 나온 금액을 원 단위로 그대로 넣으면 돼요.'}
      </p>

      {FIELDS.map((field) => (
        <label key={field.key} className="ins-row">
          <span>
            {field.label}
            <small>{mode === 'rate' ? field.rateHint : '원'}</small>
          </span>
          {mode === 'rate' ? (
            <>
              <input
                inputMode="decimal"
                value={rateText[field.key]}
                onChange={(event) => setRateText((prev) => ({ ...prev, [field.key]: event.target.value }))}
                onBlur={() => saveRates()}
              />
              <b>{formatMoney(computed[field.key])}</b>
            </>
          ) : (
            <input
              className="ins-row__wide"
              inputMode="numeric"
              value={amountText[field.key]}
              onChange={(event) => setAmountText((prev) => ({ ...prev, [field.key]: event.target.value }))}
              onBlur={() => saveAmounts()}
            />
          )}
        </label>
      ))}

      <button
        type="button"
        className="text-btn"
        onClick={() => {
          const rates = DEFAULT_RATES
          const next = calcInsuranceFromRates(data.contractSalary, rates)
          const amounts = {
            pension: next.pension,
            health: next.health,
            longTermCare: next.longTermCare,
            employment: next.employment,
          }
          setRateText(asText(rates))
          setAmountText(asText(amounts))
          onChange({ rates, insuranceMode: data.insuranceMode, amounts })
        }}
      >
        2026년 기본값으로 되돌리기
      </button>
    </div>
  )
}
