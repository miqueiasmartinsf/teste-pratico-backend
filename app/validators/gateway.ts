import vine from '@vinejs/vine'

export const updateGatewayValidator = vine.create({
  isActive: vine.boolean().optional(),
  priority: vine.number().min(0).optional(),
})
