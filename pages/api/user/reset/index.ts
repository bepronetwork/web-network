import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { Op } from "sequelize";

import models from "db/models";

import { error as LogError } from "helpers/api/handle-log";

const DAY = 1000 * 60 * 60 * 24;

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { address, githubLogin } = req.body;

  try {
    const user = await models.user.findOne({ where: {
      address: address.toLowerCase(),
      githubLogin: githubLogin.toLowerCase()
    } });

    if (!user) 
      return res.status(404).json("User not found");

    const headerWallet = (req.headers.wallet as string).toLowerCase();
    const token = await getToken({req});

    if ( headerWallet !== user.address || !token || token?.login !== githubLogin )
      return res.status(401).json("Unauthorized");

    const hasSevenDays = (((new Date()).getTime() - user.resetedAt) / DAY) > 7;

    if (!hasSevenDays) return res.status(409).json("LESS_THAN_7_DAYS");

    const issuesWithPullRequestsByAccount = await models.issue.findAndCountAll({
      where: {
        state: {
          [Op.notIn]: ["canceled", "closed"]
        }
      },
      include: [{
        association: "pullRequests",
        required: true,
        where: {
          status: {
            [Op.not]: "canceled"
          },
          githubLogin
        }
      }]
    });

    if (issuesWithPullRequestsByAccount.count > 0) return res.status(409).json("PULL_REQUESTS_OPEN");

    user.resetedAt = new Date();
    user.githubHandle = null;
    user.githubLogin = null;

    await user.save();

    return res.status(200).json("User reseted sucessfully");
  } catch(e) {
    LogError("Reset Account", { req, address, githubLogin, error: e });
    return res.status(500).json(e);
  }
}

export default async function ResetUser(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
