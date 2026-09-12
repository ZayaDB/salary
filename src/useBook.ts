import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createBook,
  DEFAULT_CONTRACT,
  loadLocal,
  makeRoomId,
  normalizeRoomId,
  readRoomFromUrl,
  saveLocal,
  writeRoomToUrl,
} from './storage'
import { canUseCloud, pullRoom, pushRoom } from './sync'
import type { AppData, DayEntry, SyncStatus } from './types'

function newer(left: AppData, right: AppData): AppData {
  return left.updatedAt >= right.updatedAt ? left : right
}

export function useBook() {
  const [data, setData] = useState<AppData | null>(null)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState<SyncStatus>('local')
  const [cloudReady, setCloudReady] = useState(false)
  const pushTimer = useRef<number | null>(null)
  const dataRef = useRef<AppData | null>(null)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const persist = useCallback((next: AppData, options?: { silent?: boolean }) => {
    const stamped = { ...next, updatedAt: Date.now() }
    dataRef.current = stamped
    setData(stamped)
    saveLocal(stamped)
    writeRoomToUrl(stamped.roomId)

    if (!canUseCloud()) {
      setStatus('local')
      setCloudReady(false)
      return stamped
    }

    if (pushTimer.current) window.clearTimeout(pushTimer.current)
    if (!options?.silent) setStatus('saving')

    pushTimer.current = window.setTimeout(() => {
      void pushRoom(stamped.roomId, stamped)
        .then(() => setStatus('synced'))
        .catch(() => setStatus('error'))
    }, 500)

    return stamped
  }, [])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const local = loadLocal()
      const urlRoom = readRoomFromUrl()
      const cloud = canUseCloud()
      setCloudReady(cloud)

      let current = local

      if (urlRoom && cloud) {
        try {
          const remote = await pullRoom(urlRoom)
          if (remote) {
            current = current && current.roomId === urlRoom ? newer(current, remote) : remote
          } else if (!current || current.roomId !== urlRoom) {
            current = createBook({
              contractSalary: current?.contractSalary ?? DEFAULT_CONTRACT,
              roomId: urlRoom,
            })
          } else {
            current = { ...current, roomId: urlRoom }
          }
        } catch {
          current = current ?? createBook({ contractSalary: DEFAULT_CONTRACT, roomId: urlRoom })
        }
      }

      if (!cancelled) {
        if (current) {
          saveLocal(current)
          writeRoomToUrl(current.roomId)
          setData(current)
          setStatus(cloud ? 'synced' : 'local')
          if (cloud) {
            void pushRoom(current.roomId, current).catch(() => setStatus('error'))
          }
        }
        setReady(true)
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onVisible() {
      const current = dataRef.current
      if (!current || document.visibilityState !== 'visible' || !canUseCloud()) return

      void pullRoom(current.roomId)
        .then((remote) => {
          if (!remote) return
          const latest = dataRef.current
          if (!latest) return
          if (remote.updatedAt > latest.updatedAt) {
            dataRef.current = remote
            setData(remote)
            saveLocal(remote)
            setStatus('synced')
          }
        })
        .catch(() => setStatus('error'))
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const start = useCallback(
    (input: { contractSalary: number; roomId?: string }) => {
      const roomId = input.roomId ? normalizeRoomId(input.roomId) : makeRoomId()
      const book = createBook({ contractSalary: input.contractSalary, roomId })
      persist(book)
      setCloudReady(canUseCloud())
    },
    [persist],
  )

  const join = useCallback(
    async (roomId: string, contractSalary?: number) => {
      const id = normalizeRoomId(roomId)
      const cloud = canUseCloud()
      setCloudReady(cloud)

      if (cloud) {
        try {
          const remote = await pullRoom(id)
          if (remote) {
            persist(remote)
            setStatus('synced')
            return
          }
        } catch {
          setStatus('error')
        }
      }

      persist(
        createBook({
          contractSalary: contractSalary ?? data?.contractSalary ?? DEFAULT_CONTRACT,
          roomId: id,
        }),
      )
    },
    [data, persist],
  )

  const update = useCallback(
    (patch: Partial<Omit<AppData, 'version' | 'updatedAt' | 'days'>>) => {
      if (!dataRef.current) return
      persist({ ...dataRef.current, ...patch })
    },
    [persist],
  )

  const setDay = useCallback(
    (key: string, entry: DayEntry | null) => {
      if (!dataRef.current) return
      const days = { ...dataRef.current.days }
      if (entry) days[key] = entry
      else delete days[key]
      persist({ ...dataRef.current, days })
    },
    [persist],
  )

  const replaceAll = useCallback(
    (next: AppData) => {
      persist(next)
    },
    [persist],
  )

  return {
    data,
    ready,
    status,
    cloudReady,
    start,
    join,
    update,
    setDay,
    replaceAll,
  }
}
