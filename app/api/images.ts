import db from "db"
import { NextApiRequest, NextApiResponse } from "blitz"

const handler = async function (req: NextApiRequest, res: NextApiResponse) {
  let privateImages = await db.dataset.findMany({
    select: {
      id: true,
      submission: true,
    },
  })

  privateImages = privateImages.filter(
    ({ submission }) => 1 <= submission.length && submission.length <= 40
  )

  res.status(200).json(JSON.stringify(privateImages, null, 2))
}

export default handler
