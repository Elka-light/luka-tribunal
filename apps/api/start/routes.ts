/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const JurisdictionsController = () => import('#controllers/jurisdictions_controller')
const ReportsController = () => import('#controllers/reports_controller')
const SessionsController = () => import('#controllers/sessions_controller')
const AdminReportsController = () => import('#controllers/admin_reports_controller')
const AdminJurisdictionsController = () => import('#controllers/admin_jurisdictions_controller')
import { middleware } from '#start/kernel'
const { reportThrottle, loginThrottle, adminThrottle } = await import('#start/limiter')

router.get('/health', async () => {
  return {
    status: 'ok',
    service: 'luka-tribunal-api',
  }
})

router
  .group(() => {
    router.get('/jurisdictions', [JurisdictionsController, 'index'])
    router.get('/jurisdictions/:slug', [JurisdictionsController, 'show'])
    router.post('/reports', [ReportsController, 'store']).use(reportThrottle)
  })
  .prefix('/api/v1')

router
  .post('/api/v1/admin/session', [SessionsController, 'store'])
  .use(middleware.trustedOrigin())
  .use(loginThrottle)
router
  .group(() => {
    router.get('/session', [SessionsController, 'show'])
    router.delete('/session', [SessionsController, 'destroy'])
    router.get('/reports', [AdminReportsController, 'index'])
    router.patch('/reports/:id', [AdminReportsController, 'update'])
    router.get('/jurisdictions', [AdminJurisdictionsController, 'index'])
    router.post('/jurisdictions', [AdminJurisdictionsController, 'store'])
    router.put('/jurisdictions/:id', [AdminJurisdictionsController, 'update'])
    router.post('/jurisdictions/:id/publish', [AdminJurisdictionsController, 'publish'])
  })
  .prefix('/api/v1/admin')
  .use(middleware.auth())
  .use(middleware.trustedOrigin())
  .use(adminThrottle)
