import { NextApiRequest, NextApiResponse } from "next";

import { IssueRoute } from "middleware";

import { Logger } from "services/logging";

import { get, put } from "server/common/bounty";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "get":
      res.status(200).json(await get(req));
      break;

    case "put":
      res.status(200).json(await put(req));
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    Logger.error(error, "issue endpoint error", req);
    res.status(error?.status || 500).json(error?.message || error?.toString());
  }

  res.end();
}

export default IssueRoute(handler);