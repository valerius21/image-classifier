import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetDataset = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetDataset), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const dataset = await db.dataset.findFirst({ where: { id } })

  if (!dataset) throw new NotFoundError()

  return dataset
})
