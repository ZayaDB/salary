const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function formatWon(value: number): string {
  const abs = Math.abs(Math.round(value))
  return `${value < 0 ? '-' : ''}${abs.toLocaleString('ko-KR')}`
}

export function formatWonUnit(value: number): string {
  return `${formatWon(value)}원`
}

export function formatMan(value: number): string {
  const man = value / 10000
  if (Number.isInteger(man)) return `${man.toLocaleString('ko-KR')}만`
  return `${man.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}만`
}

export function formatMoney(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000 && abs % 1000 === 0) {
    return `${value < 0 ? '-' : ''}${formatMan(abs)} 원`
  }
  return formatWonUnit(value)
}

export function formatMonthTitle(year: number, month: number): string {
  return `${year}년 ${month + 1}월`
}

export function formatDayTitle(key: string): string {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return `${year}년 ${month}월 ${day}일 ${WEEKDAYS[date.getDay()]}요일`
}

export function formatShortDay(key: string): string {
  const parts = key.split('-')
  return `${Number(parts[1])}월 ${Number(parts[2])}일`
}

export function monthLabel(month: number): string {
  return `${month + 1}월`
}

export { WEEKDAYS }
