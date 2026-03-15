/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { UserRole } from '#models/user'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const GatewaysController = () => import('#controllers/gateways_controller')
const ClientsController = () => import('#controllers/clients_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const DocsController = () => import('#controllers/docs_controller')

router
  .group(() => {
    // ─── Public Routes ────────────────────────────────────────────────────
    router.get('docs', [DocsController, 'index'])
    router.get('docs/openapi.json', [DocsController, 'openapi'])

    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
      })
      .prefix('auth')

    // Public: make a purchase
    router.post('transactions/purchase', [TransactionsController, 'purchase'])

    // ─── Private Routes (require auth) ────────────────────────────────────
    router
      .group(() => {
        // Profile & auth management
        router.get('account/profile', [ProfileController, 'show'])
        router.post('auth/logout', [AuthController, 'logout'])

        // Gateways – ADMIN only
        router
          .group(() => {
            router.get('/', [GatewaysController, 'index'])
            router.patch('/:id', [GatewaysController, 'update'])
          })
          .prefix('gateways')
          .use(middleware.role({ roles: [UserRole.ADMIN] }))

        // Users – ADMIN & MANAGER
        router
          .group(() => {
            router.get('/', [UsersController, 'index'])
            router.get('/:id', [UsersController, 'show'])
            router.post('/', [UsersController, 'store'])
            router.put('/:id', [UsersController, 'update'])
            router.delete('/:id', [UsersController, 'destroy'])
          })
          .prefix('users')
          .use(middleware.role({ roles: [UserRole.ADMIN, UserRole.MANAGER] }))

        // Products – ADMIN, MANAGER & FINANCE
        router
          .group(() => {
            router.get('/', [ProductsController, 'index'])
            router.get('/:id', [ProductsController, 'show'])
            router.post('/', [ProductsController, 'store'])
            router.put('/:id', [ProductsController, 'update'])
            router.delete('/:id', [ProductsController, 'destroy'])
          })
          .prefix('products')
          .use(middleware.role({ roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE] }))

        // Clients (all authenticated users)
        router
          .group(() => {
            router.get('/', [ClientsController, 'index'])
            router.get('/:id', [ClientsController, 'show'])
          })
          .prefix('clients')

        // Transactions
        router
          .group(() => {
            router.get('/', [TransactionsController, 'index'])
            router.get('/:id', [TransactionsController, 'show'])
            // Refund – ADMIN & FINANCE only
            router
              .post('/:id/refund', [TransactionsController, 'refund'])
              .use(middleware.role({ roles: [UserRole.ADMIN, UserRole.FINANCE] }))
          })
          .prefix('transactions')
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
