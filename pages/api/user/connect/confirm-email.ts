import { NextApiRequest, NextApiResponse } from "next";

import { withCORS } from "middleware";

import { error as LogError } from "services/logging";

import { get } from "server/common/user/email";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method.toLowerCase()) {
    case "get":
      await get(req)
      res.redirect("/profile?emailVerification=success");
      break;

    default:
      res.status(405);
    }
  } catch (error) {
    LogError(error);
    res.redirect(`/profile?emailVerificationError=${error.toString()}`);
  }

  res.end();
}

export default withCORS(handler);