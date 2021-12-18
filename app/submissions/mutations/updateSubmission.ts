import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateSubmission = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateSubmission),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const submission = await db.submission.update({ where: { id }, data })

    return submission
  }
)
