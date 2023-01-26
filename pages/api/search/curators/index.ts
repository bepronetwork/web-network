import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages} from "helpers/paginate";
import {resJsonMessage} from "helpers/res-json-message";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import {error} from "services/logging";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const whereCondition: WhereOptions = {};

    const { address, isCurrentlyCurator, networkName, page, chainShortName } = req.query || {};

    if (networkName) {
      const network = await models.network.findOne({
        where: {
          name: {
            [Op.iLike]: String(networkName).replaceAll(" ", "-"),
          }
        },
        include: [
          { 
            association: "chain",
            where: {
              chainShortName: chainShortName
            }
          }
        ]
      });

      if (!network) return resJsonMessage("Invalid network", res,404);

      whereCondition.networkId = network?.id;
    }

    if (address) whereCondition.address = address;

    if (isCurrentlyCurator)
      whereCondition.isCurrentlyCurator = isCurrentlyCurator;

    const curators = await models.curator
      .findAndCountAll(paginate({
            attributes: {
              exclude: ["id"],
            },
            where: whereCondition,
            nest: true,
      },
                                req.query,
          [[req.query.sortBy || "acceptedProposals", req.query.order || "DESC"]]))
      .then(async (items) => {
        return Promise.all(items.rows.map(async (item) => {
          item.dataValues.disputes =
            await models.dispute.count({
              where: { address: item.address },
            });
          return item;
        }))
          .then((values) => ({ count: items.count, rows: values }))
          .catch(() => items);
      });

    return res.status(200).json({
      ...curators,
      currentPage: +page || 1,
      pages: calculateTotalPages(curators.count),
    });
  } catch (e) {
    error(e)
    return res.status(500);
  }
}

async function SearchCurators(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default LogAccess(WithCors(WithValidChainId(SearchCurators)));
