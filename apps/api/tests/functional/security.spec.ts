import { test } from '@japa/runner'

test.group('Public and administrative boundaries', () => {
  test('rejects an invalid anonymous report before database access', async ({ client }) => {
    const response = await client.post('/api/v1/reports').json({
      jurisdictionId: 'not-a-uuid',
      category: 'free-form-category',
      comment: 'test',
    })

    response.assertStatus(422)
  })

  test('refuses unauthenticated access to report administration', async ({ client }) => {
    const response = await client.get('/api/v1/admin/reports')

    response.assertStatus(401)
  })

  test('rejects an administrative mutation without a trusted browser origin', async ({
    client,
  }) => {
    const response = await client.post('/api/v1/admin/session').json({
      email: 'admin@example.test',
      password: 'test-only-password',
    })

    response.assertStatus(403)
    response.assertBodyContains({ error: { code: 'UNTRUSTED_ORIGIN' } })
  })

  test('adds defensive headers to API responses', async ({ client }) => {
    const response = await client.get('/health')

    response.assertHeader('x-content-type-options', 'nosniff')
    response.assertHeader('x-frame-options', 'DENY')
    response.assertHeader('permissions-policy', 'geolocation=(), camera=(), microphone=()')
  })
})
