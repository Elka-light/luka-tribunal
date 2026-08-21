import vine from '@vinejs/vine'

export const listJurisdictionsValidator = vine.compile(
  vine.object({
    q: vine.string().trim().maxLength(100).optional(),
    province: vine.string().trim().maxLength(120).optional(),
    city: vine.string().trim().maxLength(120).optional(),
    limit: vine.number().min(1).max(50).optional(),
  })
)

export const jurisdictionSlugValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
)
