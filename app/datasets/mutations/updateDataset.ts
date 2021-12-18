import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateDataset = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateDataset),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const dataset = await db.dataset.update({ where: { id }, data })

    return dataset
  }
)
