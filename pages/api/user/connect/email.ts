import { NextApiRequest, NextApiResponse } from "next";

import { UserRoute } from "middleware";

import { error as LogError } from "services/logging";

import { put } from "server/common/user/email";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "put":
      res.status(200).json(await put(req));
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

export default UserRoute(handler);