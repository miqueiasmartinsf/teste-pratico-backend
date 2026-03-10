import { UserSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class User extends UserSchema {

  @column()


}
