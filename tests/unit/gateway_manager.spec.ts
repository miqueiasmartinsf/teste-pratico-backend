import { test } from '@japa/runner'
import GatewayManagerService from '#services/gateway_manager_service'
import Gateway from '#models/gateway'

test.group('GatewayManagerService', () => {
  const stubGatewayQuery = (gateways: Array<Pick<Gateway, 'id' | 'name'>>) => {
    const originalQuery = Gateway.query

    Gateway.query = ((() => {
      const query = {
        where: () => query,
        orderBy: () => gateways,
      }

      return query
    }) as unknown) as typeof Gateway.query

    return () => {
      Gateway.query = originalQuery
    }
  }

  test('should throw when no active gateways', async ({ assert }) => {
    const restoreGatewayQuery = stubGatewayQuery([])
    const manager = new GatewayManagerService()

    try {
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
    } finally {
      restoreGatewayQuery()
    }
  })

  test('should try next gateway when first fails', async ({ assert }) => {
    const restoreGatewayQuery = stubGatewayQuery([{ id: 2, name: 'FakeGateway2' } as Gateway])
    const manager = new GatewayManagerService()

    try {
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
    } finally {
      restoreGatewayQuery()
    }
  })
})
