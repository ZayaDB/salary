import { useEffect, useState } from 'react'
import { DEFAULT_RATES, isRoomId, normalizeRoomId, parseBook } from '../storage'
import { formatMoney } from '../format'
import type { AppData, InsuranceRates, SyncStatus } from '../types'

type Props = {
  data: AppData
  status: SyncStatus
  cloudReady: boolean
  onSalary: (value: number) => void
  onRates: (rates: InsuranceRates) => void
  onJoin: (roomId: string) => void
  onReplace: (next: AppData) => void
}

const RATE_FIELDS: Array<{ key: keyof InsuranceRates; label: string; hint: string }> = [
  { key: 'pension', label: '국민연금', hint: '월급의 %' },
  { key: 'health', label: '건강보험', hint: '월급의 %' },
  { key: 'longTermCare', label: '장기요양', hint: '건강보험료의 %' },
  { key: 'employment', label: '고용보험', hint: '월급의 %' },
]

export function Settings({ data, status, cloudReady, onSalary, onRates, onJoin, onReplace }: Props) {
  const [man, setMan] = useState(String(data.contractSalary / 10000))
  const [rateText, setRateText] = useState({
    pension: String(data.rates.pension),
    health: String(data.rates.health),
    longTermCare: String(data.rates.longTermCare),
    employment: String(data.rates.employment),
  })
  const [room, setRoom] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    setMan(String(data.contractSalary / 10000))
    setRateText({
      pension: String(data.rates.pension),
      health: String(data.rates.health),
      longTermCare: String(data.rates.longTermCare),
      employment: String(data.rates.employment),
    })
  }, [data.contractSalary, data.rates])

  function saveSalary() {
    const value = Number(man)
    if (!Number.isFinite(value) || value <= 0) return
    onSalary(Math.round(value * 10000))
  }

  function saveRates(nextText = rateText) {
    const next = {
      pension: Number(nextText.pension),
      health: Number(nextText.health),
      longTermCare: Number(nextText.longTermCare),
      employment: Number(nextText.employment),
    }
    if (Object.values(next).some((rate) => !Number.isFinite(rate) || rate < 0)) return
    onRates(next)
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      window.alert(text)
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `salary-${data.roomId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importJson(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseBook(JSON.parse(String(reader.result)))
        if (!parsed) {
          window.alert('이 파일은 장부 형식이 아니에요')
          return
        }
        onReplace(parsed)
      } catch {
        window.alert('파일을 읽지 못했어요')
      }
    }
    reader.readAsText(file)
  }

  const shareLink = `${window.location.origin}?room=${data.roomId}`
  const statusText =
    status === 'synced'
      ? '사장님 폰과 맞춰 두는 중'
      : status === 'saving'
        ? '저장하는 중'
        : status === 'error'
          ? '지금은 이 폰에만 저장됨'
          : '이 폰에만 저장됨'

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">설정</p>
        <h1 className="page-title">우리 숫자</h1>
      </header>

      <section className="card">
        <p className="section-title">계약 월급</p>
        <label className="field">
          <span>한 달에 약속한 돈</span>
          <div className="field__row">
            <input
              inputMode="decimal"
              value={man}
              onChange={(event) => setMan(event.target.value)}
              onBlur={saveSalary}
            />
            <em>만 원</em>
          </div>
          <small>지금 {formatMoney(data.contractSalary)}</small>
        </label>
      </section>

      <section className="card">
        <p className="section-title">4대보험 요율</p>
        <p className="hint">2026년 근로자 부담을 먼저 넣었어요. 고지서와 다르면 여기 숫자를 바꾸면 돼요. 산재보험은 사장님이 내서 빼지 않았어요.</p>
        {RATE_FIELDS.map((field) => (
          <label key={field.key} className="field field--slim">
            <span>
              {field.label}
              <small> {field.hint}</small>
            </span>
            <input
              inputMode="decimal"
              value={rateText[field.key]}
              onChange={(event) =>
                setRateText((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
              onBlur={() => saveRates()}
            />
          </label>
        ))}
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            setRateText({
              pension: String(DEFAULT_RATES.pension),
              health: String(DEFAULT_RATES.health),
              longTermCare: String(DEFAULT_RATES.longTermCare),
              employment: String(DEFAULT_RATES.employment),
            })
            onRates(DEFAULT_RATES)
          }}
        >
          2026년 기본값으로 되돌리기
        </button>
      </section>

      <section className="card">
        <p className="section-title">사장님과 같이 보기</p>
        <p className="room-code">{data.roomId}</p>
        <p className="hint">
          {cloudReady
            ? statusText
            : '이 컴퓨터에서는 이 폰(브라우저)에만 저장돼요. Netlify에 올리면 같은 코드로 사장님도 볼 수 있어요.'}
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={() => void copyText(data.roomId, '코드')}>
            코드 복사
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => void copyText(shareLink, '링크')}>
            링크 복사
          </button>
        </div>
        {copied ? <p className="hint">{copied}를 복사했어요</p> : null}

        <label className="field">
          <span>다른 코드로 들어가기</span>
          <input
            value={room}
            autoCapitalize="characters"
            placeholder="사장님 코드"
            onChange={(event) => setRoom(event.target.value.toUpperCase())}
          />
        </label>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => {
            const id = normalizeRoomId(room)
            if (!isRoomId(id)) {
              window.alert('코드 6자리를 입력해 주세요')
              return
            }
            if (window.confirm('이 폰의 장부가 그 코드 장부로 바뀌어요. 계속할까요?')) {
              void onJoin(id)
              setRoom('')
            }
          }}
        >
          이 코드로 바꾸기
        </button>
      </section>

      <section className="card">
        <p className="section-title">백업</p>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={exportJson}>
            파일로 저장
          </button>
          <label className="btn btn--ghost file-btn">
            파일 가져오기
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) importJson(file)
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </section>
    </div>
  )
}
