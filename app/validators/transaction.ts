import vine from '@vinejs/vine'

export const purchaseValidator = vine.create({
  client: vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().maxLength(254),
  }),
  products: vine
    .array(
      vine.object({
        id: vine.number().positive(),
        quantity: vine.number().positive().min(1),
      })
    )
    .minLength(1),
  card: vine.object({
    number: vine.string().minLength(16).maxLength(16),
    cvv: vine.string().minLength(3).maxLength(4),
  }),
})
