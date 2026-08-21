import { test } from '@japa/runner'

test.group('Health endpoint', () => {
  test('returns the API status without internal details', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBody({ status: 'ok', service: 'luka-tribunal-api' })
  })
})
