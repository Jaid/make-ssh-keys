import type {PrivateKeyFormat} from '#src/keys/PrivateKey.ts'

import {generateEd25519KeyMaterial} from '#src/keyMaterial.ts'
import PrivateKey from '#src/keys/PrivateKey.ts'
import PublicKey from '#src/keys/PublicKey.ts'

export default class KeyPair {
  static async make() {
    const key = new KeyPair
    await key.init()
    return key
  }

  private material: Awaited<ReturnType<typeof generateEd25519KeyMaterial>> | undefined

  getPrivateKey(options: {comment?: string
    format?: PrivateKeyFormat} = {}) {
    if (!this.material) {
      throw new Error('Key pair not generated yet')
    }
    return new PrivateKey(this.material, options.format ?? 'openssh', options.comment)
  }

  getPublicKey(options: {comment?: string} = {}) {
    if (!this.material) {
      throw new Error('Key pair not generated yet')
    }
    return new PublicKey(this.material.publicKey, options.comment)
  }

  private async init() {
    this.material = await generateEd25519KeyMaterial()
  }
}
