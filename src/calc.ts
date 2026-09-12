import type { AppData, InsuranceRates, MonthCursor } from './types'

export function floorWon(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value)
}

export function calcInsurance(salary: number, rates: InsuranceRates) {
  const pension = floorWon((salary * rates.pension) / 100)
  const health = floorWon((salary * rates.health) / 100)
  const longTermCare = floorWon((health * rates.longTermCare) / 100)
  const employment = floorWon((salary * rates.employment) / 100)
  const total = pension + health + longTermCare + employment

  return { pension, health, longTermCare, employment, total }
}

export function monthPrefix(cursor: MonthCursor): string {
  return `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-`
}

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function todayKey(now = new Date()): string {
  return dayKey(now.getFullYear(), now.getMonth(), now.getDate())
}

export function parseDayKey(key: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  }
}

export function monthTotal(data: AppData, cursor: MonthCursor): number {
  const prefix = monthPrefix(cursor)
  let total = 0
  for (const [key, entry] of Object.entries(data.days)) {
    if (key.startsWith(prefix)) total += entry.amount || 0
  }
  return total
}

export function monthDaysInGrid(cursor: MonthCursor) {
  const first = new Date(cursor.year, cursor.month, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: Array<number | null> = []

  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)

  return { cells, daysInMonth, startWeekday }
}

export function settleMonth(data: AppData, cursor: MonthCursor) {
  const actual = monthTotal(data, cursor)
  const insurance = calcInsurance(data.contractSalary, data.rates)
  const officialPay = data.contractSalary - insurance.total
  const diff = actual - data.contractSalary

  return {
    actual,
    insurance,
    officialPay,
    diff,
    extraFromBoss: Math.max(0, diff),
    returnToBoss: Math.max(0, -diff),
    inHand: actual - insurance.total,
    enteredDays: Object.keys(data.days).filter((key) => key.startsWith(monthPrefix(cursor))).length,
  }
}

export function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const date = new Date(cursor.year, cursor.month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function isSameMonth(cursor: MonthCursor, date = new Date()): boolean {
  return cursor.year === date.getFullYear() && cursor.month === date.getMonth()
}
