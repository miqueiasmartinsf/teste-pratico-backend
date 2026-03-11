/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    auth: {
      register: typeof routes['auth.auth.register']
      login: typeof routes['auth.auth.login']
      logout: typeof routes['auth.auth.logout']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
}
