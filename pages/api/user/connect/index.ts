import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {Op} from "sequelize";

import models from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";

import { withProtected } from "middleware";

import { Logger } from "services/logging";

enum Actions {
  REGISTER = "register",
  CONNECT_GITHUB = "github"
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  let action;

  try {
    const token = await getToken({ req });

    const githubLogin = token.login.toString();
    const address = token.address.toString();

    const user = await models.user.findOne({
      where: { 
        [Op.or]: [
          { 
            address: caseInsensitiveEqual("address", address)
          },
          {
            githubLogin: caseInsensitiveEqual("githubLogin", githubLogin)
          }
        ]
      }
    });

    if (!user) action = Actions.REGISTER;
    else if (user.address && !user.githubLogin) action = Actions.CONNECT_GITHUB;

    if (!action) 
      return res.status(409).json("No actions needed for this user");

    if (action === Actions.REGISTER) {
      if(!address)
        return res.status(404).json("Missing WalletAddress");
        
      await models.user.create({
        address,
        githubHandle: token.name || githubLogin,
        githubLogin
      });
    } else if (action === Actions.CONNECT_GITHUB) {
      user.githubLogin = githubLogin;
      user.githubHandle = token.name || githubLogin;

      await user.save();
    }

    return res.status(200).json("Success");
  } catch (error) {
    Logger.error(error, `Failed to ${action || "no action"} user`, { req });
    return res.status(500).json(error?.toString());
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "patch":
    await patch(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withProtected(handler);
