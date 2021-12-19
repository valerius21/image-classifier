import db from "db"
import { NextApiRequest, NextApiResponse } from "blitz"

const handler = async function (req: NextApiRequest, res: NextApiResponse) {
  // const result = await db.submission.create({
  //   data: {
  //     userId: "f9401782-12ad-4caa-875d-681fa1fd995a",
  //     datasetId: "5db8b560-4070-4e2a-8fee-32206834898c",
  //   },
  // })
  res.status(200).json({
    // result,
  })
}

export default handler
