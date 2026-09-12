import { parseBook } from './storage'
import type { AppData } from './types'

export async function pullRoom(roomId: string): Promise<AppData | null> {
  const response = await fetch(`/api/sync?room=${encodeURIComponent(roomId)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('pull-failed')

  const json: unknown = await response.json()
  if (!json || typeof json !== 'object' || !('data' in json)) return null
  const data = (json as { data: unknown }).data
  if (data == null) return null
  return parseBook(data)
}

export async function pushRoom(roomId: string, data: AppData): Promise<void> {
  const response = await fetch(`/api/sync?room=${encodeURIComponent(roomId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('push-failed')
}

export function canUseCloud(): boolean {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
}
