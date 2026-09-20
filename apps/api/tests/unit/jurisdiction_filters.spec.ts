import { test } from '@japa/runner'
import { listJurisdictionsValidator } from '#validators/jurisdiction'

test.group('Public map pagination', () => {
  test('accepts a second page and keeps validated filters', async ({ assert }) => {
    const filters = await listJurisdictionsValidator.validate({
      limit: '50',
      offset: '50',
      province: 'Kinshasa',
    })
    assert.equal(filters.limit, 50)
    assert.equal(filters.offset, 50)
    assert.equal(filters.province, 'Kinshasa')
  })

  test('rejects fractional, negative and excessive page parameters', async ({ assert }) => {
    for (const value of [
      { offset: -1 },
      { offset: 0.5 },
      { offset: 100001 },
      { limit: 0 },
      { limit: 51 },
      { limit: 1.5 },
    ]) {
      await assert.rejects(() => listJurisdictionsValidator.validate(value))
    }
  })
})
