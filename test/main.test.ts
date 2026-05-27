import {expect, test} from 'bun:test'

const {default: makeSshKeys} = await import('#src/main.ts')
test('should run', async () => {
  const result = await makeSshKeys()
  expect(result).toMatchObject({
    privateKey: expect.stringMatching(/^-+BEGIN [ A-Z]+-+/),
    publicKey: expect.stringMatching(/^ssh-ed25519 /),
  })
})
