import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetSubmission = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetSubmission), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const submission = await db.submission.findFirst({ where: { id } })

  if (!submission) throw new NotFoundError()

  return submission
})
