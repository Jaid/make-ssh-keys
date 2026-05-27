import PrivateKey from '#src/keys/PrivateKey.ts'
import PublicKey from '#src/keys/PublicKey.ts'

export default class KeyPair {
  static async make() {
    const key = new KeyPair
    await key.init()
    return key
  }
  private privateBytes: ArrayBuffer | undefined
  private publicBytes: ArrayBuffer | undefined
  getPrivateKey() {
    if (!this.privateBytes) {
      throw new Error('Key pair not generated yet')
    }
    const privateKey = new PrivateKey(this.privateBytes)
    return privateKey
  }
  getPublicKey() {
    if (!this.publicBytes) {
      throw new Error('Key pair not generated yet')
    }
    const publicKey = new PublicKey(this.publicBytes)
    return publicKey
  }
  private async init() {
    const pair = await crypto.subtle.generateKey('ed25519', true, ['sign', 'verify']) as CryptoKeyPair
    const [privateBytes, publicBytes] = await Promise.all([
      crypto.subtle.exportKey('pkcs8', pair.privateKey),
      crypto.subtle.exportKey('spki', pair.publicKey),
    ])
    this.privateBytes = privateBytes
    this.publicBytes = publicBytes
  }
}
