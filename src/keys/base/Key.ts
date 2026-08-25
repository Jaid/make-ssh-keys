import {chunk} from 'es-toolkit'

import {encodeBase64} from '#src/encoding.ts'

export default class Key {
  bytes: ArrayBuffer
  chunkSize: number | undefined
  prefix: string = ''
  suffix: string = ''
  constructor(bytes: ArrayBuffer) {
    this.bytes = bytes
  }
  getBytes() {
    return this.bytes
  }
  getString() {
    const bytes = this.getBytes()
    return encodeBase64(bytes)
  }
  getText() {
    const string = this.getString()
    const content = this.chunkSize ? chunk(string as unknown as Array<string>, this.chunkSize).join('\n') : string
    return this.prefix + content + this.suffix
  }
}
