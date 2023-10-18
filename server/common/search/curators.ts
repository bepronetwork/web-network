import { ParsedUrlQuery } from "querystring";
import { IncludeOptions, Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";
import paginate, { calculateTotalPages } from "helpers/paginate";
import { isTrue } from "helpers/string";

export default async function get(query: ParsedUrlQuery) {
  const {
    address,
    isCurrentlyCurator,
    network,
    chain,
    page,
    sortBy,
    order
  } = query;

  const whereCondition: WhereOptions = {};

  if (address)
    whereCondition.address = Sequelize.where( Sequelize.fn("lower", Sequelize.col("curator.address")),
                                              address.toString().toLowerCase());
  if(isCurrentlyCurator)
    whereCondition.isCurrentlyCurator = isTrue(isCurrentlyCurator.toString());

  const include: IncludeOptions[] = [
    { association: "delegations" },
    {
      association: "disputes",
      on: Sequelize.where(Sequelize.fn("lower", Sequelize.col("curator.address")),
                          "=",
                          Sequelize.fn("lower", Sequelize.col("disputes.address"))),
    }
  ];

  const isFilterRequired = !!(network || chain);
  if (isFilterRequired) {
    include.push({
      association: "network",
      required: isFilterRequired,
      attributes: [],
      where: {
        ... network ? { name: caseInsensitiveEqual("network.name", network.toString()) } : {}
      },
      include: chain ? [{
        association: "chain",
        attributes: [],
        required: true,
        where: {
          chainShortName: caseInsensitiveEqual("network.chain.chainShortName", chain.toString())
        }
      }] : []
    });
  } else {
    include.push({
      association: "network",
      include: [
        { association: "networkToken" },
        { association: "chain", attributes: ["chainShortName"] },
      ],
    });
  }

  const PAGE = +(page || 1);

  const curators = await models.curator.findAndCountAll(paginate({
    logging: console.log,
    attributes: {
      exclude: ["id", "createdAt", "updatedAt"],
    },
    where: whereCondition,
    include,
    subQuery: false,
  }, { page: PAGE }, [[sortBy || "acceptedProposals", order || "DESC"]]));

  const totalCurators = await models.curator.count({
    where: {
      isCurrentlyCurator: true,
    },
    ...(network
      ? {
          include: {
            association: "network",
            required: true,
            attributes: [],
            where: {
              name: caseInsensitiveEqual("network.name", network.toString()),
            },
          },
      }
      : null),
  });

  return {
    ...curators,
    currentPage: PAGE,
    pages: calculateTotalPages(curators.count),
    totalCurators,
  };
}