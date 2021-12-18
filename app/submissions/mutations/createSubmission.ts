import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateSubmission = z.object({
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateSubmission),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const submission = await db.submission.create({ data: input })

    return submission
  }
)
