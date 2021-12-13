import models from "@db/models";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "OPTIONS"],
    origin: process.env.NEXT_PUBLIC_API_HOST,
  })
);

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  // Run the cors middleware
  cors(req, res);

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
