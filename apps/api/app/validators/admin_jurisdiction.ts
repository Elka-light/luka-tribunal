import vine from '@vinejs/vine'

export const createAdminJurisdictionValidator = vine.compile(
  vine.object({
    slug: vine
      .string()
      .trim()
      .maxLength(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    officialName: vine.string().trim().maxLength(200),
    jurisdictionType: vine.string().trim().maxLength(80),
    province: vine.string().trim().maxLength(120),
    city: vine.string().trim().maxLength(120).optional(),
    address: vine.string().trim().maxLength(500),
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
    coordinateSource: vine.string().trim().maxLength(500),
    informationSource: vine.string().trim().maxLength(500),
    verifiedAt: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
  })
)
