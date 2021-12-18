import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetSubmissionsInput
  extends Pick<Prisma.SubmissionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSubmissionsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: submissions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.submission.count({ where }),
      query: (paginateArgs) => db.submission.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      submissions,
      nextPage,
      hasMore,
      count,
    }
  }
)
