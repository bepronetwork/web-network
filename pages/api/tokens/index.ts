import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";

import Database from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {

  const tokens = await Database.tokens.findAll();

  if (!tokens) return res.status(404);

  return res.status(200).json(tokens);
}

async function tokensEndPoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(tokensEndPoint);
