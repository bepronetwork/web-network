import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import paginate from "helpers/paginate";
import { withCors } from "middleware";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    action: [action]
  } = req.query;

  if (action === "all")
    return res
      .status(200)
      .json(await models.user.findAll(paginate({ raw: true }, req.body, [
            [req.body.sortBy || "updatedAt", req.body.order || "DESC"]
      ])));

  if (action === "login")
    return res.status(200).json(await models.user.findAll({
        raw: true,
        where: { githubLogin: { [Op.in]: req.body || [] } }
    }));

  if (action === "address")
    return res.status(200).json(await models.user.findAll({
        raw: true,
        where: {
          address: { [Op.in]: (req.body || []).map((s) => s.toLowerCase()) }
        }
    }));

  return res.status(404).json([]);
}

async function SearchUsers(req: NextApiRequest,
                                          res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default  withCors(SearchUsers)