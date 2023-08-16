import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import paginate from "helpers/paginate";

import { withCORS } from "middleware";

import {error as LogError} from "services/logging";

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

    const users = await models.user.findAll(paginate(queryOptions, req.body));

    return res.status(200).json(users);
  } catch (error) {
    LogError("Failed to search users", { req, error });
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
