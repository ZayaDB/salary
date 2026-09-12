import { useState } from 'react'
import { DEFAULT_CONTRACT, isRoomId, normalizeRoomId } from '../storage'

type Props = {
  onCreate: (contractSalary: number) => void
  onJoin: (roomId: string, contractSalary: number) => void
}

export function Onboarding({ onCreate, onJoin }: Props) {
  const [man, setMan] = useState(String(DEFAULT_CONTRACT / 10000))
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [room, setRoom] = useState('')
  const [error, setError] = useState('')

  function salary(): number {
    const value = Number(man)
    if (!Number.isFinite(value) || value <= 0) return DEFAULT_CONTRACT
    return Math.round(value * 10000)
  }

  return (
    <div className="onboard">
      <div className="onboard__mark">장부</div>
      <p className="eyebrow">나와 사장님만 보는</p>
      <h1>월급 장부</h1>
      <p className="onboard__lead">
        매일 번 돈을 적고, 월급날에는 4대보험을 뺀 뒤 450만보다 더 벌었는지 덜 벌었는지 바로 계산해요.
      </p>

      <label className="field">
        <span>계약 월급</span>
        <div className="field__row">
          <input
            inputMode="decimal"
            value={man}
            onChange={(event) => setMan(event.target.value)}
          />
          <em>만 원</em>
        </div>
      </label>

      <div className="unit-toggle">
        <button type="button" className={mode === 'create' ? 'is-on' : ''} onClick={() => setMode('create')}>
          새로 시작
        </button>
        <button type="button" className={mode === 'join' ? 'is-on' : ''} onClick={() => setMode('join')}>
          사장님 코드 입력
        </button>
      </div>

      {mode === 'join' ? (
        <label className="field">
          <span>공유 코드</span>
          <input
            value={room}
            autoCapitalize="characters"
            placeholder="예: K7M2P9"
            onChange={(event) => setRoom(event.target.value.toUpperCase())}
          />
          <small>두 사람이 같은 코드를 쓰면 같은 장부가 보여요</small>
        </label>
      ) : (
        <p className="hint">시작하면 공유 코드를 만들어 드려요. 그 코드를 사장님 폰에도 넣으면 같이 볼 수 있어요.</p>
      )}

      {error ? <p className="error">{error}</p> : null}

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => {
          if (mode === 'join') {
            const id = normalizeRoomId(room)
            if (!isRoomId(id)) {
              setError('코드 6자리를 입력해 주세요')
              return
            }
            onJoin(id, salary())
            return
          }
          onCreate(salary())
        }}
      >
        {mode === 'join' ? '이 코드로 들어가기' : '장부 만들기'}
      </button>
    </div>
  )
}
