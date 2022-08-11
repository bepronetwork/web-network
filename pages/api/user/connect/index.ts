import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { Op } from "sequelize";

import models from "db/models";

import { error as LogError } from "helpers/api/handle-log";

enum Actions {
  REGISTER = "register",
  RESET = "reset"
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  let action;

  try {
    const token = await getToken({req});

    const githubLogin = token.login;
    const address = req.headers.wallet?.toString().toLowerCase();

    const user = await models.user.findOne({ 
      where: { 
        [Op.or]: [{ address }, {githubLogin }]
      }
    });

    if (!user) action = Actions.REGISTER;
    else if (user.address && !user.githubLogin && user.resetedAt) action = Actions.RESET;

    if (!action) 
      return res.status(409).json("No actions needed for this user");

    if (action === Actions.REGISTER) {
      await models.user.create({
        address,
        githubHandle: token.name || githubLogin,
        githubLogin
      });
    } else if (action === Actions.RESET) {
      
      user.githubLogin = githubLogin;
      user.githubHandle = token.name || githubLogin;

      await user.save();
    }

    return res.status(200).json("Success");
  } catch (error) {
    LogError(`Failed to ${action} user`, { req, error });
    return res.status(500).json(error);
  }
}

export default async function ConnectUser(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "patch":
    await patch(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
