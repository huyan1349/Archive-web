import type { ParsedClipping } from '../parser/types'

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  const array = Array.from(new Uint8Array(buffer))
  return array.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function buildHashPayload(clipping: ParsedClipping): string {
  const base = [
    clipping.title,
    clipping.author,
    clipping.type,
    clipping.location ?? '',
    clipping.content,
  ].join('\u0000')

  if (clipping.clippedAt) {
    return base + '\u0000' + clipping.clippedAt.toISOString()
  }

  return base
}

export async function computeSourceHash(clipping: ParsedClipping): Promise<string> {
  const payload = buildHashPayload(clipping)
  return sha256(payload)
}
