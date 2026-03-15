import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)
const role = () => vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const)

/**
 * Validator to use when performing self-signup
 */
export const registerValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Validator for creating a user (admin)
 */
export const createUserValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: role(),
})

/**
 * Validator for updating a user
 */
export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    email: vine.string().email().maxLength(254).optional(),
    password: password().optional(),
    role: role().optional(),
  })
)
