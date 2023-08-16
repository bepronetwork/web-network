import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages} from "helpers/paginate";
import {resJsonMessage} from "helpers/res-json-message";

import { withCORS } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const { owner, name, path, networkName, page, chainId, includeIssues } = req.query || {};

  if (path)
    whereCondition.githubPath = {
      [Op.in]: String(path).split(",")
    };

  if (name) whereCondition.githubPath = { [Op.iLike]: `%/${name}%` };
  if (owner) whereCondition.githubPath = { [Op.iLike]: `%${owner}/%` };
  if (networkName) {
    const networks = await models.network.findAll({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        ... chainId ? { chain_id: +chainId } : {}
      }
    });

    if (!networks?.length) return resJsonMessage("Invalid network", res, 404);

    whereCondition.network_id = {
      [Op.in]: networks.map(({ id }) => id)
    };
  }

  const repositories = 
    await models.repositories.findAndCountAll(paginate({ 
      where: whereCondition,
      nest: true,
      include: [
        { association: "network" },
        ... includeIssues ? [{ association: "issues" }] : []
      ]
    }, req.query, []));

  return res.status(200).json({
    ...repositories,
    currentPage: +page || 1,
    pages: calculateTotalPages(repositories.count)
  });
}

async function SearchRepositories(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withCORS(WithValidChainId(SearchRepositories));
