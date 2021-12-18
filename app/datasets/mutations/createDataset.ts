import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateDataset = z.object({
  name: z.string(),
})

export default resolver.pipe(resolver.zod(CreateDataset), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const dataset = await db.dataset.create({ data: input })

  return dataset
})
