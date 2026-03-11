import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'hashedPassword',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  public id!: string

  @column()
  public email!: string

  @column()
  public name!: string

  @column({ serializeAs: null })
  public hashedPassword!: string

  @column()
  public role!: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 minutes',
    table: 'auth_tokens',
  })
}
