import {decodeBase64Url} from '#src/encoding.ts'

export type Ed25519KeyMaterial = {
  privateKeyPkcs8: ArrayBuffer
  privateKeySeed: Uint8Array
  publicKey: Uint8Array
}

type Ed25519PrivateJwk = {
  crv?: string
  d?: string
  kty?: string
}

export const generateEd25519KeyMaterial = async (): Promise<Ed25519KeyMaterial> => {
  const pair = await crypto.subtle.generateKey('ed25519', true, ['sign', 'verify']) as CryptoKeyPair
  const [privateJwk, privateKeyPkcs8, publicKey] = await Promise.all([
    crypto.subtle.exportKey('jwk', pair.privateKey) as Promise<Ed25519PrivateJwk>,
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
    crypto.subtle.exportKey('raw', pair.publicKey),
  ])
  if (privateJwk.kty !== 'OKP' || privateJwk.crv !== 'Ed25519' || typeof privateJwk.d !== 'string') {
    throw new Error('Generated Ed25519 private key data is incomplete')
  }
  const privateKeySeed = decodeBase64Url(privateJwk.d)
  const publicKeyBytes = new Uint8Array(publicKey)
  if (privateKeySeed.length !== 32 || publicKeyBytes.length !== 32) {
    throw new Error('Generated Ed25519 key has an unexpected length')
  }
  return {
    privateKeyPkcs8,
    privateKeySeed,
    publicKey: publicKeyBytes,
  }
}
