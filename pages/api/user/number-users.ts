import models from "@db/models";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from 'nextjs-cors';

async function getTotal(req: NextApiRequest , res: NextApiResponse) {
  // Run the cors middleware
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
 });

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
