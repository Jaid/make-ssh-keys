import {expect, test} from 'bun:test'

const {default: makeSshKeys} = await import('#src/main.ts')

test('should run', () => {
  const result = makeSshKeys()
  expect(result).toBe('make-ssh-keys') // TODO Test actual functionality
})
