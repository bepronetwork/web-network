import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages} from "helpers/paginate";
import {chainFromHeader} from "../../../../helpers/chain-from-header";
import {resJsonMessage} from "../../../../helpers/res-json-message";
import {WithValidChainId} from "../../../../middleware/with-valid-chain-id";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {};

  const {owner, name, path, networkName, page} = req.query || {};

  if (path)
    whereCondition.githubPath = {
      [Op.in]: String(path).split(",")
    };

  if (name) whereCondition.githubPath = { [Op.iLike]: `%/${name}%` };
  if (owner) whereCondition.githubPath = { [Op.iLike]: `%${owner}/%` };
  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        },
        chain_id: {[Op.eq]: (await chainFromHeader(req))?.chainId }
      }
    });

    if (!network) return resJsonMessage("Invalid network", res, 404);

    whereCondition.network_id = network.id;
  }

  const repositories = 
    await models.repositories.findAndCountAll(paginate({ where: whereCondition, nest: true }, req.query, []));

  return res.status(200).json({
    ...repositories,
    currentPage: +page || 1,
    pages: calculateTotalPages(repositories.count)
  });
}

async function SearchRepositories(req: NextApiRequest,
                                  res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withCors(WithValidChainId(SearchRepositories))