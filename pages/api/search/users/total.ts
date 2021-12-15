import models from "@db/models";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import initMiddleware from "@helpers/middlewareCors";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "OPTIONS"],
    origin: process.env.NEXT_PUBLIC_HOST_LANDING_PAGE,
  })
);

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  // Run the cors middleware
  // await cors(req, res);

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
