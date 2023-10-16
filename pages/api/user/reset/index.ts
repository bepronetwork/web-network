import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

import { UserRoute } from "middleware";

import { Logger } from "services/logging";

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body.context.user;

    const user = await models.user.findOne({
      where: {
        id,
      },
    });

    if (!user) return res.status(404).json("User not found");

    user.resetedAt = new Date();
    user.githubLogin = null;

    await user.save();

    return res.status(200).json("User reseted sucessfully");
  } catch (error) {
    Logger.error(error, "Reset Account", { req, error });
    return res.status(500).json(error);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default UserRoute(handler);
