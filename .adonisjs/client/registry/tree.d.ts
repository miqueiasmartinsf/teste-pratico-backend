/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
  }
  transactions: {
    purchase: typeof routes['transactions.purchase']
    index: typeof routes['transactions.index']
    show: typeof routes['transactions.show']
    refund: typeof routes['transactions.refund']
  }
  profile: {
    show: typeof routes['profile.show']
  }
  gateways: {
    index: typeof routes['gateways.index']
    update: typeof routes['gateways.update']
  }
  users: {
    index: typeof routes['users.index']
    show: typeof routes['users.show']
    store: typeof routes['users.store']
    update: typeof routes['users.update']
    destroy: typeof routes['users.destroy']
  }
  products: {
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  clients: {
    index: typeof routes['clients.index']
    show: typeof routes['clients.show']
  }
}
