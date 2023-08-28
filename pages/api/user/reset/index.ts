import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {Op, Sequelize} from "sequelize";

import models from "db/models";

import { withProtected } from "middleware";

import { Logger } from "services/logging";

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getToken({ req });

    const githubLogin = token.login.toString();
    const address = token.address.toString();

    const user = await models.user.findOne({
      where: {
      address: address.toLowerCase(),
      githubLogin: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("githubLogin")), "=", githubLogin.toLowerCase())
      }
    });

    if (!user) 
      return res.status(404).json("User not found");

    user.resetedAt = new Date();
    user.githubLogin = null;

    await user.save();

    return res.status(200).json("User reseted sucessfully");
  } catch(error) {
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

export default withProtected(handler);
