import {chunk} from 'es-toolkit'

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
    return Buffer.from(bytes).toString('base64')
  }
  getText() {
    const string = this.getString()
    const content = this.chunkSize ? chunk(string as unknown as Array<string>, this.chunkSize).join('\n') : string
    return this.prefix + content + this.suffix
  }
}
