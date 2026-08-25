/* eslint-disable typescript/no-restricted-imports -- Keep the interoperability test dependency-free. */
import {afterEach, expect, test} from 'bun:test'
import {createPrivateKey} from 'node:crypto'
import {chmod, mkdtemp, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import makeSshKeys from '#src/main.ts'

const temporaryFolders: Array<string> = []
const readTypeScriptFiles = async (folder: string): Promise<Array<string>> => {
  const files: Array<string> = []
  for (const entry of await readdir(folder, {withFileTypes: true})) {
    const file = path.join(folder, entry.name)
    if (entry.isDirectory()) {
      files.push(...await readTypeScriptFiles(file))
    } else if (entry.isFile() && file.endsWith('.ts')) {
      files.push(file)
    }
  }
  return files
}
const stripPublicKeyComment = (value: string) => value.trim().split(/\s+/u).slice(0, 2).join(' ')
const run = async (args: Array<string>) => {
  const process = Bun.spawn(args, {
    stderr: 'pipe',
    stdout: 'pipe',
  })
  const [exitCode, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
  ])
  return {
    exitCode,
    stderr,
    stdout,
  }
}
const getSshKeygen = () => {
  if (process.platform === 'win32') {
    return 'C:/Windows/System32/OpenSSH/ssh-keygen.exe'
  }
  return 'ssh-keygen'
}
const hardenPrivateKeyFile = async (file: string) => {
  if (process.platform !== 'win32') {
    await chmod(file, 0o600)
    return
  }
  const userName = Bun.env.USERNAME ?? Bun.env.USER
  if (!userName) {
    return
  }
  const result = await run(['icacls', file.replaceAll('/', '\\'), '/inheritance:r', '/grant:r', `${userName}:R`])
  if (result.exitCode !== 0) {
    throw new Error(`Could not harden test private key permissions: ${result.stderr}`)
  }
}
afterEach(async () => {
  await Promise.all(temporaryFolders.splice(0).map(folder => rm(folder, {
    force: true,
    recursive: true,
  })))
})
test('generates an OpenSSH Ed25519 key pair by default', async () => {
  const result = await makeSshKeys()
  expect(result.privateKey).toMatch(/^-{5}BEGIN OPENSSH PRIVATE KEY-{5}/u)
  expect(result.publicKey).toMatch(/^ssh-ed25519 A{4}C3NzaC1lZDI1NTE5A{4}I/u)
})
test('adds a comment to OpenSSH key representations', async () => {
  const result = await makeSshKeys({comment: 'sample@example.test'})
  expect(result.publicKey).toEndWith(' sample@example.test')
  expect(result.privateKey).toMatch(/^-{5}BEGIN OPENSSH PRIVATE KEY-{5}/u)
})
test('can emit PKCS#8 private keys explicitly', async () => {
  const result = await makeSshKeys({privateKeyFormat: 'pkcs8'})
  expect(result.privateKey).toMatch(/^-{5}BEGIN PRIVATE KEY-{5}/u)
  expect(result.publicKey).toMatch(/^ssh-ed25519 A{4}C3NzaC1lZDI1NTE5A{4}I/u)
  expect(() => createPrivateKey(result.privateKey)).not.toThrow()
})
test('generated OpenSSH keys interoperate with ssh-keygen', async () => {
  const result = await makeSshKeys({comment: 'interop@example.test'})
  const folder = await mkdtemp(path.join(os.tmpdir(), 'make-ssh-keys-'))
  temporaryFolders.push(folder)
  const privateKeyFile = path.join(folder, 'id_ed25519')
  const publicKeyFile = `${privateKeyFile}.pub`
  await Promise.all([
    writeFile(privateKeyFile, `${result.privateKey}\n`),
    writeFile(publicKeyFile, `${result.publicKey}\n`),
  ])
  await hardenPrivateKeyFile(privateKeyFile)
  const derived = await run([getSshKeygen(), '-y', '-f', privateKeyFile])
  expect(derived.exitCode, derived.stderr).toBe(0)
  expect(stripPublicKeyComment(derived.stdout)).toBe(stripPublicKeyComment(result.publicKey))
  const privateFingerprint = await run([getSshKeygen(), '-l', '-f', privateKeyFile])
  expect(privateFingerprint.exitCode, privateFingerprint.stderr).toBe(0)
  expect(privateFingerprint.stdout).toContain('interop@example.test')
  const publicFingerprint = await run([getSshKeygen(), '-l', '-f', publicKeyFile])
  expect(publicFingerprint.exitCode, publicFingerprint.stderr).toBe(0)
})
test('runtime source is Web API compatible', async () => {
  const files = await readTypeScriptFiles(path.resolve('src'))
  const sources = await Promise.all(files.map(async file => ({
    file,
    text: await readFile(file, 'utf8'),
  })))
  for (const source of sources) {
    expect(source.text, source.file).not.toMatch(/from ["']node:/u)
    expect(source.text, source.file).not.toMatch(/\bBuffer\b/u)
  }
})
