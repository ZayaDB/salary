import { useMemo, useState } from 'react'
import { DayEditor } from './components/DayEditor'
import { CalendarScreen } from './screens/CalendarScreen'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Settings } from './screens/Settings'
import { Settle } from './screens/Settle'
import { useBook } from './useBook'
import type { MonthCursor, TabId } from './types'

const TABS: Array<{ id: TabId; label: string; icon: typeof IconHome }> = [
  { id: 'home', label: '홈', icon: IconHome },
  { id: 'calendar', label: '달력', icon: IconCal },
  { id: 'settle', label: '정산', icon: IconPay },
  { id: 'settings', label: '설정', icon: IconGear },
]

export default function App() {
  const book = useBook()
  const [tab, setTab] = useState<TabId>('home')
  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState<string | null>(null)

  function changeMonth(next: MonthCursor) {
    setCursor(next)
    setSelected(null)
  }

  const editorEntry = editorKey && book.data ? book.data.days[editorKey] : undefined

  const frameClass = useMemo(() => (book.data ? 'app' : 'app app--plain'), [book.data])

  if (!book.ready) {
    return (
      <div className="phone">
        <div className="splash">
          <em>장부</em>
          <p>월급 장부</p>
        </div>
      </div>
    )
  }

  if (!book.data) {
    return (
      <div className="phone">
        <div className="app app--plain">
          <Onboarding
            onCreate={(contractSalary) => book.start({ contractSalary })}
            onJoin={(roomId, contractSalary) => {
              void book.join(roomId, contractSalary)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="phone">
      <div className={frameClass}>
        <main className="app__main">
          {tab === 'home' ? (
            <Home data={book.data} cursor={cursor} onCursor={changeMonth} onOpenDay={setEditorKey} />
          ) : null}
          {tab === 'calendar' ? (
            <CalendarScreen
              data={book.data}
              cursor={cursor}
              selected={selected}
              onCursor={changeMonth}
              onSelect={setSelected}
              onOpenDay={setEditorKey}
            />
          ) : null}
          {tab === 'settle' ? (
            <Settle
              data={book.data}
              cursor={cursor}
              onCursor={changeMonth}
              onInsurance={(patch) => book.update(patch)}
            />
          ) : null}
          {tab === 'settings' ? (
            <Settings
              data={book.data}
              status={book.status}
              cloudReady={book.cloudReady}
              onSalary={(contractSalary) => book.update({ contractSalary })}
              onInsurance={(patch) => book.update(patch)}
              onJoin={(roomId) => void book.join(roomId)}
              onReplace={book.replaceAll}
            />
          ) : null}
        </main>

        <nav className="tabbar" aria-label="메뉴">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={active ? 'is-on' : ''}
                onClick={() => setTab(item.id)}
              >
                <Icon active={active} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {editorKey ? (
          <DayEditor
            dayKey={editorKey}
            entry={editorEntry}
            onClose={() => setEditorKey(null)}
            onSave={(entry) => {
              book.setDay(editorKey, entry)
              setSelected(editorKey)
              setEditorKey(null)
            }}
            onDelete={() => {
              book.setDay(editorKey, null)
              setEditorKey(null)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M4.5 11 12 4.5 19.5 11v8.2a.8.8 0 0 1-.8.8h-4.4v-5.2H9.7v5.2H5.3a.8.8 0 0 1-.8-.8V11Z"
        stroke="currentColor"
        strokeWidth={active ? 1.9 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCal({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
      <path d="M4 10h16M8 3.8v3.4M16 3.8v3.4" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    </svg>
  )
}

function IconPay({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
      <path d="M12 8.2v7.6M9.4 10.2c.6-1 1.6-1.5 2.6-1.5 1.6 0 2.6.8 2.6 2 0 2.6-5.2 1.4-5.2 4 0 1.2 1.1 2.1 2.8 2.1 1.1 0 2.1-.5 2.6-1.4" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} strokeLinecap="round" />
    </svg>
  )
}

function IconGear({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
      <path
        d="M12 5.2v1.6M12 17.2v1.6M5.2 12h1.6M17.2 12h1.6M7.2 7.2l1.1 1.1M15.7 15.7l1.1 1.1M16.8 7.2l-1.1 1.1M8.3 15.7l-1.1 1.1"
        stroke="currentColor"
        strokeWidth={active ? 1.9 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  )
}
