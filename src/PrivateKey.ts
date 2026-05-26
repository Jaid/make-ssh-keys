export default class PrivateKey {
  static async make() {
    const privateKey = new PrivateKey
    await privateKey.init()
    return privateKey
  }
  private algorithm: Parameters<SubtleCrypto['generateKey']>[0]
  private keyPair: CryptoKeyPair | undefined
  constructor(algorithm: typeof PrivateKey.prototype.algorithm = 'ed25519') {
    this.algorithm = algorithm
  }
  @withKeyPair
  async getBytes() {
    return crypto.subtle.exportKey('pkcs8', this.keyPair.privateKey)
  }
  @withKeyPair
  async getString() {
    const bytes = await this.getBytes()
    return Buffer.from(bytes).toString('base64')
  }
  @withKeyPair
  async getText() {
    const string = await this.getString()
    const lines = string.match(/.{1,64}/g)?.join('\n') ?? string
    return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`
  }
  private async init() {
    this.keyPair = await crypto.subtle.generateKey(this.algorithm, true, ['sign', 'verify']) as CryptoKeyPair
  }
}
