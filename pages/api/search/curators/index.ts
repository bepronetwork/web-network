import { NextApiRequest, NextApiResponse } from "next";
import { Op, Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import handleNetworkValues from "helpers/handleNetworksValuesApi";
import paginate, {calculateTotalPages} from "helpers/paginate";
import {resJsonMessage} from "helpers/res-json-message";

import { LogAccess } from "middleware/log-access";
import { WithValidChainId } from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import { error } from "services/logging";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const whereCondition: WhereOptions = {};

    const { address, isCurrentlyCurator, networkName, page, chainShortName } = req.query || {};

    let queryParams = {};

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
              ...(chainShortName
                ? {
                    chainShortName: Sequelize.where(Sequelize.fn("lower",
                                                                 Sequelize.col("chain.chainShortName")),
                                                    chainShortName.toString().toLowerCase()),
                }
                : {}),
            },
          },
        ],
      });

      if (!network) return resJsonMessage("Invalid network", res, 404);

      whereCondition.networkId = network?.id;
    }

    queryParams = {
      include: [
        {
          association: "network",
          include: [
            { association: "networkToken" },
            {
              association: "chain",
              where: {
                ...(chainShortName
                  ? {
                      chainShortName: Sequelize.where(Sequelize.fn("lower",
                                                                   Sequelize.col("network.chain.chainShortName")),
                                                      chainShortName.toString().toLowerCase()),
                  }
                  : {}),
              },
              required: true,
            },
          ],
          required: true,
        },
      ],
    };

    if (address)
      whereCondition.address = Sequelize.where(Sequelize.fn("lower", Sequelize.col("curator.address")),
                                               address.toString().toLowerCase());

    if (isCurrentlyCurator)
      whereCondition.isCurrentlyCurator = isCurrentlyCurator;

    const curators = await models.curator
      .findAndCountAll(paginate({
            attributes: {
              exclude: ["id"],
            },
            where: whereCondition,
            nest: true,
            ...queryParams,
      },
      where: whereCondition,
      nest: true,
      include: [
        {
          association: "network",
          include: [
            { association: "networkToken" },
            { association: "chain" },
          ]
        },
        { association: "delegations" },
      ]
    }, req.query, [[req.query.sortBy || "acceptedProposals", req.query.order || "DESC"]]))
      .then(async (items) => {
        return Promise.all(items.rows.map(async (item) => {
          item.dataValues.disputes = await models.dispute.count({
              where: { address: item.address },
          });
          return item;
        }))
          .then((values) => ({ count: items.count, rows: handleNetworkValues(values) }))
          .catch(() => items);
      });

    return res.status(200).json({
      ...curators,
      currentPage: +page || 1,
      pages: calculateTotalPages(curators.count),
    });
  } catch (e) {
    error(e);
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
