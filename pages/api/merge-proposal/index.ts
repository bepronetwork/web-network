import { NextApiRequest, NextApiResponse } from "next";

import { RouteMiddleware } from "middleware";

import { error as LogError } from "services/logging";

import get from "server/common/proposal";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
    case "GET":
      res.status(200).json(await get(req.query));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    LogError(error);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }

  res.end();
}

export default RouteMiddleware(handler);