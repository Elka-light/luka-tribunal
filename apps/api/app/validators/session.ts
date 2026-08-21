import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().maxLength(320),
    password: vine.string().minLength(12).maxLength(200),
  })
)
