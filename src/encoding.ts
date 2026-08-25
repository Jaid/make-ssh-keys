const toBytes = (value: ArrayBuffer | Uint8Array) => {
  return value instanceof Uint8Array ? value : new Uint8Array(value)
}

export const concatBytes = (...parts: Array<Uint8Array>) => {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

export const decodeBase64 = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0
  }
  return bytes
}

export const decodeBase64Url = (value: string) => {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  return decodeBase64(base64 + '='.repeat((4 - base64.length % 4) % 4))
}

export const encodeBase64 = (value: ArrayBuffer | Uint8Array) => {
  const bytes = toBytes(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte)
  }
  return btoa(binary)
}
