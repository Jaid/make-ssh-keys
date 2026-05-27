import Key from '#src/keys/base/Key.ts'

export default class PublicKey extends Key {
  prefix = 'ssh-ed25519 '
}
