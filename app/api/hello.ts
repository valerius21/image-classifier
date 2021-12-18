import { NextApiRequest, NextApiResponse } from "blitz"

const handler = function (req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: "Hello, world!",
  })
}

export default handler
