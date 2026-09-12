export type DayEntry = {
  amount: number
  memo: string
}

export type InsuranceRates = {
  pension: number
  health: number
  longTermCare: number
  employment: number
}

export type AppData = {
  version: 1
  updatedAt: number
  contractSalary: number
  rates: InsuranceRates
  days: Record<string, DayEntry>
  roomId: string
}

export type TabId = 'home' | 'calendar' | 'settle' | 'settings'

export type MonthCursor = {
  year: number
  month: number
}

export type SyncStatus = 'local' | 'saving' | 'synced' | 'error'
