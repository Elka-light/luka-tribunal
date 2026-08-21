import vine from '@vinejs/vine'

export const createReportValidator = vine.compile(
  vine.object({
    jurisdictionId: vine.string().uuid(),
    category: vine.enum([
      'incorrect_address',
      'incorrect_coordinates',
      'incorrect_contact',
      'closed_or_moved',
      'other',
    ]),
    comment: vine.string().trim().maxLength(1000).optional(),
  })
)
