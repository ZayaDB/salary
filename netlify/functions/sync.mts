import { getStore } from '@netlify/blobs'

const ROOM = /^[A-Z0-9]{6,8}$/
const MAX_BYTES = 400_000

export default async (request: Request) => {
  const url = new URL(request.url)
  const room = (url.searchParams.get('room') || '').toUpperCase()

  if (!ROOM.test(room)) {
    return Response.json({ error: 'bad-room' }, { status: 400 })
  }

  const store = getStore('salary-rooms')

  if (request.method === 'GET') {
    const data = await store.get(room, { type: 'json' })
    return Response.json({ data: data ?? null })
  }

  if (request.method === 'PUT') {
    const text = await request.text()
    if (text.length > MAX_BYTES) {
      return Response.json({ error: 'too-large' }, { status: 413 })
    }

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return Response.json({ error: 'bad-json' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'bad-body' }, { status: 400 })
    }

    await store.setJSON(room, body)
    return Response.json({ ok: true })
  }

  return new Response('method', { status: 405 })
}
