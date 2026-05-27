import Key from '#src/keys/base/Key.ts'

export default class PrivateKey extends Key {
  chunkSize = 64
  prefix = '-----BEGIN PRIVATE KEY-----\n'
  suffix = '\n-----END PRIVATE KEY-----'
}
