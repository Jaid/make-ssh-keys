import KeyPair from '#src/KeyPair.ts'

const makeSshKeys = async () => {
  const key = await KeyPair.make()
  const result = {
    privateKey: key.getPrivateKey().getText(),
    publicKey: key.getPublicKey().getText(),
  }
  return result
}

export default makeSshKeys
