/* eslint-disable no-throw-literal, style/max-statements-per-line, prefer-promise-reject-errors  */
import { describe, expect, it } from 'vitest'
import thenRef from './index'

const syncResolve = () => 1
const asyncResolve = () => Promise.resolve(1)
function syncReject() { throw 1 }
const asyncReject = () => Promise.reject(1)

describe('then-ref', () => {
  it('value', async () => {
    expect(thenRef(syncResolve)().value).toBe(1)
    expect(thenRef(syncResolve()).value).toBe(1)
    expect(await thenRef(asyncResolve()).value).toBe(1)
  })

  it('then', async () => {
    expect(thenRef(syncResolve()).then((res: number) => ++res).value).toBe(2)
    expect(await thenRef(asyncResolve()).then((res: number) => ++res).value).toBe(2)
  })

  it('catch', async () => {
    expect(thenRef(syncReject)().catch((res: number) => ++res).value).toBe(2)
    expect(await thenRef(asyncReject()).catch((res: number) => ++res).value).toBe(2)
  })

  it('finally', async () => {
    let count = 0
    expect(thenRef(syncResolve()).finally(() => count++).then((res: number) => ++res).value).toBe(2)
    expect(count).toBe(1)

    expect(await thenRef(asyncResolve()).finally(() => count++).then((res: number) => ++res).value).toBe(2)
    expect(count).toBe(2)

    expect(thenRef(syncReject)().finally(() => count++).catch((res: number) => ++res).value).toBe(2)
    expect(count).toBe(3)

    expect(await thenRef(asyncReject()).finally(() => count++).catch((res: number) => ++res).value).toBe(2)
    expect(count).toBe(4)
  })

  it('then.onrejected', async () => {
    expect(thenRef(syncReject)().then(null, (res: number) => ++res).value).toBe(2)
    expect(await thenRef(asyncReject()).then(null, (res: number) => ++res).value).toBe(2)
  })

  it('then -> catch', async () => {
    expect(thenRef(syncReject)().then((res: number) => ++res).catch((res: number) => ++res).value).toBe(2)
    expect(await thenRef(asyncReject()).then((res: number) => ++res).catch((res: number) => ++res).value).toBe(2)
  })

  it('then -> finally', async () => {
    expect(thenRef(syncResolve()).then((res: number) => ++res).finally(() => 3).value).toBe(2)
    expect(await thenRef(asyncResolve()).then((res: number) => ++res).finally(() => 3).value).toBe(2)
  })

  it('then.onrejected -> then', async () => {
    expect(thenRef(syncReject)().then(null, (res: number) => ++res).then((res: number) => ++res).value).toBe(3)
    expect(await thenRef(asyncReject()).then(null, (res: number) => ++res).then((res: number) => ++res).value).toBe(3)
  })

  it('then.onrejected -> catch', async () => {
    expect(thenRef(syncReject)().then(null, (res: number) => ++res).catch((res: number) => ++res).value).toBe(2)
    expect(await thenRef(asyncReject()).then(null, (res: number) => ++res).catch((res: number) => ++res).value).toBe(2)
  })

  it('catch -> then', async () => {
    expect(thenRef(syncReject)().catch((res: number) => ++res).then((res: number) => ++res).value).toBe(3)
    expect(await thenRef(asyncReject()).catch((res: number) => ++res).then((res: number) => ++res).value).toBe(3)
  })

  it('catch -> finally', async () => {
    expect(thenRef(syncReject)().catch((res: number) => ++res).finally(() => 3).value).toBe(2)
    expect(await thenRef(asyncReject()).catch((res: number) => ++res).finally(() => 3).value).toBe(2)
  })

  it('then -> catch -> then', async () => {
    expect(thenRef(syncResolve()).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).value).toBe(3)
    expect(await thenRef(asyncResolve()).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).value).toBe(3)
  })

  it('then -> catch -> finally', async () => {
    let count = 0
    expect(thenRef(syncResolve()).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).finally(() => count++).value).toBe(3)
    expect(count).toBe(1)

    expect(await thenRef(asyncResolve()).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).finally(() => count++).value).toBe(3)
    expect(count).toBe(2)
  })

  it('then -> finally -> then', async () => {
    let count = 0
    expect(thenRef(syncResolve()).then((res: number) => ++res).finally(() => count++).then((res: number) => ++res).value).toBe(3)
    expect(count).toBe(1)

    expect(await thenRef(asyncResolve()).then((res: number) => ++res).finally(() => count++).then((res: number) => ++res).value).toBe(3)
    expect(count).toBe(2)
  })

  it('then -> finally -> catch', async () => {
    let count = 0
    expect(thenRef(syncResolve()).then((res: number) => { throw res + 1 }).finally(() => count++).catch((res: number) => ++res).value).toBe(3)
    expect(count).toBe(1)

    expect(await thenRef(asyncResolve()).then((res: number) => { throw res + 1 }).finally(() => count++).catch((res: number) => ++res).value).toBe(3)
    expect(count).toBe(2)
  })

  it('catch -> then -> catch', async () => {
    expect(thenRef(syncReject)().catch((res: number) => ++res).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).value).toBe(4)
    expect(await thenRef(asyncReject()).catch((res: number) => ++res).then((res: number) => { throw res + 1 }).catch((res: number) => ++res).value).toBe(4)
  })

  it('catch -> then -> finally', async () => {
    let count = 0
    expect(thenRef(syncReject)().catch((res: number) => ++res).then((res: number) => ++res).finally(() => count++).value).toBe(3)
    expect(count).toBe(1)

    expect(await thenRef(asyncReject()).catch((res: number) => ++res).then((res: number) => ++res).finally(() => count++).value).toBe(3)
    expect(count).toBe(2)
  })

  it('catch -> finally -> then', async () => {
    let count = 0
    expect(thenRef(syncReject)().catch((res: number) => ++res).finally(() => count++).then((res: number) => ++res).value).toBe(3)
    expect(count).toBe(1)

    expect(await thenRef(asyncReject()).catch((res: number) => ++res).finally(() => count++).then((res: number) => ++res).value).toBe(3)
    expect(count).toBe(2)
  })

  it('catch -> finally -> catch', async () => {
    let count = 0
    expect(thenRef(syncReject)().catch((res: number) => ++res).finally(() => count++).catch((res: number) => ++res).value).toBe(2)
    expect(count).toBe(1)

    expect(await thenRef(asyncReject()).catch((res: number) => ++res).finally(() => count++).catch((res: number) => ++res).value).toBe(2)
    expect(count).toBe(2)
  })

  it('nesting', async () => {
    expect(thenRef(thenRef(syncResolve))().value).toBe(1)
    expect(await thenRef(thenRef(asyncResolve())).value).toBe(1)

    expect(thenRef(syncResolve)().then((res: number) => thenRef(res)).value).toBe(1)
    expect(await thenRef(asyncResolve)().then((res: number) => thenRef(res)).value).toBe(1)
  })
})
