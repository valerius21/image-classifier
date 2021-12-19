import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetDatasetsInput
  extends Pick<Prisma.DatasetFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetDatasetsInput) => {
    const {
      items: datasets,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.dataset.count({ where }),
      query: (paginateArgs) => db.dataset.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      datasets,
      nextPage,
      hasMore,
      count,
    }
  }
)
