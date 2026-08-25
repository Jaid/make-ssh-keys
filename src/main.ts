import type {PrivateKeyFormat} from '#src/keys/PrivateKey.ts'

import KeyPair from '#src/KeyPair.ts'

export type {PrivateKeyFormat} from '#src/keys/PrivateKey.ts'

export type MakeSshKeysOptions = {
  comment?: string
  privateKeyFormat?: PrivateKeyFormat
}

const makeSshKeys = async (options: MakeSshKeysOptions = {}) => {
  const key = await KeyPair.make()
  return {
    privateKey: key.getPrivateKey({
      comment: options.comment,
      format: options.privateKeyFormat,
    }).getText(),
    publicKey: key.getPublicKey({comment: options.comment}).getText(),
  }
}

export default makeSshKeys
