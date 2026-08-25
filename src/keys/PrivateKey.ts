import type {Ed25519KeyMaterial} from '#src/keyMaterial.ts'

import Key from '#src/keys/base/Key.ts'
import {serializeOpenSshPrivateKey} from '#src/keys/sshEncoding.ts'

export type PrivateKeyFormat = 'openssh' | 'pkcs8'

const serializePkcs8PrivateKey = (bytes: ArrayBuffer) => {
  const key = new Key(bytes)
  key.chunkSize = 64
  key.prefix = '-----BEGIN PRIVATE KEY-----\n'
  key.suffix = '\n-----END PRIVATE KEY-----'
  return key.getText()
}

export default class PrivateKey {
  constructor(readonly material: Ed25519KeyMaterial,
    readonly format: PrivateKeyFormat,
    readonly comment?: string) {}

  getText() {
    switch (this.format) {
      case 'openssh': {
        return serializeOpenSshPrivateKey(this.material, this.comment)
      }
      case 'pkcs8': {
        return serializePkcs8PrivateKey(this.material.privateKeyPkcs8)
      }
    }
  }
}
