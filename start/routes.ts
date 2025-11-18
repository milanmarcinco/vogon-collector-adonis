/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'

import swagger from '#config/swagger'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const DevicesController = () => import('#controllers/devices_controller')

router.get('/healthcheck', async () => ({ success: true }))

// ===== Auth =====

router
  .group(() => {
    router.post('/sign-up', [AuthController, 'signUp'])
    router.post('/sign-in', [AuthController, 'signIn'])

    router
      .group(() => {
        router.get('/me', [AuthController, 'me'])
        router.delete('/sign-out', [AuthController, 'signOut'])
        router.delete('/delete', [AuthController, 'delete'])
      })
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )
  })
  .prefix('/auth')

// ===== Business logic routes =====

router
  .group(() => {
    router.post('/devices', [DevicesController, 'store'])
    router.delete('/devices/:deviceId', [DevicesController, 'destroy'])

    router.get('/devices/:deviceId/config', [DevicesController, 'getConfigForDevice'])
    router.get('/devices/:deviceId/certificate', [DevicesController, 'getCertificateForDevice'])
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )

// ===== Swagger routes =====

// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar('/swagger') // to use Scalar instead. If you want, you can pass proxy url as second argument here.
  // return AutoSwagger.default.rapidoc('/swagger', 'view') // to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})
