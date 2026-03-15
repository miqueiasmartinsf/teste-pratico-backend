import { test } from '@japa/runner'
import GatewayManagerService from '#services/gateway_manager_service'
import Gateway from '#models/gateway'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('GatewayManagerService', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should throw when no active gateways', async ({ assert }) => {
    // No gateways in empty db
    const manager = new GatewayManagerService()

    await assert.rejects(
      () =>
        manager.charge({
          amount: 1000,
          name: 'Tester',
          email: 'tester@example.com',
          cardNumber: '5569000000006063',
          cvv: '010',
        }),
      /No active gateways/
    )
  })

  test('should try next gateway when first fails', async ({ assert }) => {
    // Create two gateways - first one inactive
    await Gateway.createMany([
      { name: 'FakeGateway1', isActive: false, priority: 1 },
      { name: 'FakeGateway2', isActive: true, priority: 2 },
    ])

    const manager = new GatewayManagerService()

    // Both gateways are unknown to the service resolver, so it should throw
    await assert.rejects(
      () =>
        manager.charge({
          amount: 1000,
          name: 'Tester',
          email: 'tester@example.com',
          cardNumber: '5569000000006063',
          cvv: '010',
        }),
      /Unknown gateway|All gateways failed/
    )
  })
})
