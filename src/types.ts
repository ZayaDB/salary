export type DayEntry = {
  amount: number
  memo: string
}

export type InsuranceKey = 'pension' | 'health' | 'longTermCare' | 'employment'

export type InsuranceRates = Record<InsuranceKey, number>

export type InsuranceAmounts = Record<InsuranceKey, number>

export type InsuranceMode = 'rate' | 'amount'

export type AppData = {
  version: 1
  updatedAt: number
  contractSalary: number
  rates: InsuranceRates
  insuranceMode: InsuranceMode
  amounts: InsuranceAmounts
  days: Record<string, DayEntry>
  roomId: string
}

export type TabId = 'home' | 'calendar' | 'settle' | 'settings'

export type MonthCursor = {
  year: number
  month: number
}

export type SyncStatus = 'local' | 'saving' | 'synced' | 'error'
