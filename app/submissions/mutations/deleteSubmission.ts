import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteSubmission = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubmission),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const submission = await db.submission.deleteMany({ where: { id } })

    return submission
  }
)
