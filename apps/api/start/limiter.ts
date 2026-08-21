import limiter from '@adonisjs/limiter/services/main'

export const reportThrottle = limiter.define('reports', ({ request }) =>
  limiter.allowRequests(5).every('1 hour').usingKey(`report_${request.ip()}`).blockFor('1 hour')
)

export const loginThrottle = limiter.define('login', ({ request }) =>
  limiter
    .allowRequests(5)
    .every('15 minutes')
    .usingKey(`login_${request.ip()}`)
    .blockFor('30 minutes')
)

export const adminThrottle = limiter.define('admin', ({ auth, request }) =>
  limiter
    .allowRequests(60)
    .every('1 minute')
    .usingKey(auth.user ? `admin_${auth.user.id}` : `admin_ip_${request.ip()}`)
)
