import {serializeOpenSshPublicKey} from '#src/keys/sshEncoding.ts'

export default class PublicKey {
  constructor(readonly bytes: Uint8Array,
    readonly comment?: string) {}

  getText() {
    return serializeOpenSshPublicKey(this.bytes, this.comment)
  }
}
