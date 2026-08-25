import type {Ed25519KeyMaterial} from '#src/keyMaterial.ts'

import {concatBytes, encodeBase64} from '#src/encoding.ts'

const textEncoder = new TextEncoder
const openSshBinaryMagic = textEncoder.encode('openssh-key-v1\0')
const encodeUint32 = (value: number) => {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value)
  return bytes
}
const encodeSshString = (value: Uint8Array | string) => {
  const bytes = typeof value === 'string' ? textEncoder.encode(value) : value
  return concatBytes(encodeUint32(bytes.length), bytes)
}
const normalizeComment = (comment?: string) => {
  const normalizedComment = comment?.trim() ?? ''
  if (/[\n\r]/u.test(normalizedComment)) {
    throw new Error('SSH key comments cannot contain line breaks')
  }
  return normalizedComment
}
const serializePublicKeyBlob = (publicKey: Uint8Array) => {
  if (publicKey.length !== 32) {
    throw new Error(`Expected a 32-byte Ed25519 public key, received ${publicKey.length} bytes`)
  }
  return concatBytes(encodeSshString('ssh-ed25519'), encodeSshString(publicKey))
}
const formatOpenSshPrivateKeyPem = (bytes: Uint8Array) => {
  const base64 = encodeBase64(bytes)
  const lines = base64.match(/.{1,70}/gu) ?? []
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines.join('\n')}\n-----END OPENSSH PRIVATE KEY-----`
}

export const serializeOpenSshPublicKey = (publicKey: Uint8Array, comment?: string) => {
  const normalizedComment = normalizeComment(comment)
  const publicKeyBlob = serializePublicKeyBlob(publicKey)
  return [
    'ssh-ed25519',
    encodeBase64(publicKeyBlob),
    ...normalizedComment ? [normalizedComment] : [],
  ].join(' ')
}

export const serializeOpenSshPrivateKey = (material: Ed25519KeyMaterial, comment?: string) => {
  const normalizedComment = normalizeComment(comment)
  if (material.privateKeySeed.length !== 32) {
    throw new Error(`Expected a 32-byte Ed25519 private key seed, received ${material.privateKeySeed.length} bytes`)
  }
  const publicKeyBlob = serializePublicKeyBlob(material.publicKey)
  const checkBytes = new Uint8Array(4)
  crypto.getRandomValues(checkBytes)
  let privateSection = concatBytes(checkBytes, checkBytes, encodeSshString('ssh-ed25519'), encodeSshString(material.publicKey), encodeSshString(concatBytes(material.privateKeySeed, material.publicKey)), encodeSshString(normalizedComment))
  const paddingLength = (8 - privateSection.length % 8) % 8
  if (paddingLength > 0) {
    privateSection = concatBytes(privateSection, Uint8Array.from({length: paddingLength}, (_, index) => index + 1))
  }
  const encodedKey = concatBytes(openSshBinaryMagic, encodeSshString('none'), encodeSshString('none'), encodeSshString(new Uint8Array), encodeUint32(1), encodeSshString(publicKeyBlob), encodeSshString(privateSection))
  return formatOpenSshPrivateKeyPem(encodedKey)
}
