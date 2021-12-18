import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteDataset = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteDataset), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const dataset = await db.dataset.deleteMany({ where: { id } })

  return dataset
})
