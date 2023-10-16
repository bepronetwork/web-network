import {NextApiRequest, NextApiResponse} from "next";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";
import {Op} from "sequelize";

import models from "db/models";

import paginate from "helpers/paginate";
import { lowerCaseCompare } from "helpers/string";

import { UserTableScopes } from "interfaces/enums/api";

import { withCORS } from "middleware";

import {Logger} from "services/logging";

import { JwtToken } from "server/auth/types";
import { UserRoleUtils } from "server/utils/jwt";

const { serverRuntimeConfig } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      action: [action]
    } = req.query;

    const whereCondition = {
      all: {
        [Op.or]: [
          { address: (req?.body[0]?.toLowerCase()) },
          { githubLogin: req?.body[1] }
        ]
      },
      login: { githubLogin: { [Op.in]: req.body || [] } },
      address: { address: { [Op.in]: (req.body || []).map((s) => s?.toLowerCase()) } }
    };
  
    const queryOptions = {
      raw: true,
      attributes: {
        exclude: ["resetedAt", "createdAt", "updatedAt"]
      },
      where: whereCondition[action]
    };

    const token = (await getToken({ req, secret: serverRuntimeConfig?.auth?.secret })) as JwtToken;

    let scope = UserTableScopes.default;

    const isAdmin = UserRoleUtils.hasAdminRole(token);
    const isGovernor = UserRoleUtils.hasGovernorRole(token);
    const isSameUser = lowerCaseCompare(token?.address, req?.body[0]) || lowerCaseCompare(token?.login, req?.body[1]);

    if (isAdmin)
      scope = UserTableScopes.admin;
    else if (isGovernor || isSameUser)
      scope = UserTableScopes.ownerOrGovernor;

    const users = await models.user.scope(scope).findAll(paginate(queryOptions, req.body));

    return res.status(200).json(users);
  } catch (error) {
    Logger.error(error, "Failed to search users", { req, error });
    return res.status(500).json(error);
  }
}

async function SearchUsers(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default  withCORS(SearchUsers);
