import type { AppData, InsuranceRates } from './types'

export const STORAGE_KEY = 'salary-book-v1'

export const DEFAULT_RATES: InsuranceRates = {
  pension: 4.75,
  health: 3.595,
  longTermCare: 13.14,
  employment: 0.9,
}

export const DEFAULT_CONTRACT = 4_500_000

const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function makeRoomId(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => ROOM_CHARS[byte % ROOM_CHARS.length]).join('')
}

export function normalizeRoomId(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function isRoomId(value: string): boolean {
  return /^[A-Z0-9]{6,8}$/.test(normalizeRoomId(value))
}

export function createBook(input: { contractSalary: number; roomId: string }): AppData {
  return {
    version: 1,
    updatedAt: Date.now(),
    contractSalary: input.contractSalary,
    rates: { ...DEFAULT_RATES },
    days: {},
    roomId: normalizeRoomId(input.roomId),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseBook(value: unknown): AppData | null {
  if (!isRecord(value)) return null
  if (value.version !== 1) return null
  if (typeof value.updatedAt !== 'number') return null
  if (typeof value.contractSalary !== 'number') return null
  if (typeof value.roomId !== 'string' || !isRoomId(value.roomId)) return null
  if (!isRecord(value.rates)) return null
  if (!isRecord(value.days)) return null

  const rates: InsuranceRates = {
    pension: Number(value.rates.pension),
    health: Number(value.rates.health),
    longTermCare: Number(value.rates.longTermCare),
    employment: Number(value.rates.employment),
  }

  if (Object.values(rates).some((rate) => !Number.isFinite(rate))) return null

  const days: AppData['days'] = {}
  for (const [key, entry] of Object.entries(value.days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isRecord(entry)) continue
    const amount = Number(entry.amount)
    const memo = typeof entry.memo === 'string' ? entry.memo : ''
    if (!Number.isFinite(amount) || amount < 0) continue
    days[key] = { amount, memo }
  }

  return {
    version: 1,
    updatedAt: value.updatedAt,
    contractSalary: Math.max(0, Math.round(value.contractSalary)),
    rates,
    days,
    roomId: normalizeRoomId(value.roomId),
  }
}

export function loadLocal(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseBook(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveLocal(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function readRoomFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('room')
  if (fromQuery && isRoomId(fromQuery)) return normalizeRoomId(fromQuery)

  const hash = window.location.hash.replace(/^#/, '')
  const hashParams = new URLSearchParams(hash.startsWith('room=') ? hash : `room=${hash}`)
  const fromHash = hashParams.get('room')
  if (fromHash && isRoomId(fromHash)) return normalizeRoomId(fromHash)

  return null
}

export function writeRoomToUrl(roomId: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set('room', roomId)
  url.hash = ''
  window.history.replaceState(null, '', url)
}
