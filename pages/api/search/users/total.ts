import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  const userCount = await models.user.count();

  return res.status(200).json(userCount);
}

export default async function getAll(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case "get":
      await getTotal(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
