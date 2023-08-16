import { ParsedUrlQuery } from "querystring";
import { Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import { caseInsensitiveEqual, caseLiteral } from "helpers/db/conditionals";

export default async function get(query: ParsedUrlQuery) {
  const {
    network: name,
    address,
    chain,
    chainId,
  } = query;

  if (!name && !address || !chain && !chainId)
    throw new Error("Missing parameters");

  const networkWhere: WhereOptions = {};

  if (name)
    networkWhere.name = caseInsensitiveEqual("network.name", name.toString());

  if (address)
    networkWhere.networkAddress = caseInsensitiveEqual("network.networkAddress", address.toString());

  const chainWhere: WhereOptions = {};

  if (chain)
    chainWhere.chainShortName = caseInsensitiveEqual("chain.chainShortName", chain.toString());

  if (chainId)
    chainWhere.chainId = +chainId;

  const network = await models.network.findOne({
    where: networkWhere,
    include: [
      {
        attributes: ["chainId", "chainShortName"],
        association: "chain",
        required: true,
        where: chainWhere,
      }
    ],
  });

  if (!network)
    throw new Error("Network not found");

  const [bounties, curators, networkTokenOnClosedBounties, members] = await Promise.all([
    models.issue.findAll({
      raw: true,
      attributes: [
        "state",
        [Sequelize.fn("COUNT", Sequelize.col("issue.id")), "total"]
      ],
      group: ["issue.state"],
      where: {
        network_id: network.id,
        visible: true
      }
    })
      .then(values => Object.fromEntries(values.map(({ state, total }) => [state, +total]))),
    models.curator.findOne({
      raw: true,
      attributes: [
        [Sequelize.fn("SUM", caseLiteral(`"curator"."isCurrentlyCurator"`, 1, 0)), "total"],
        [
          Sequelize.fn("SUM", Sequelize.literal(`CAST("curator"."tokensLocked" as FLOAT)
            + CAST("curator"."delegatedToMe" as FLOAT)`)),
          "tokensLocked"
        ],
      ],
      where: {
        networkId: network.id
      }
    })
      .then(curators => ({ ...curators, total: +curators.total })),
    models.issue.findOne({
      raw: true,
      attributes: [
        [Sequelize.fn("SUM", Sequelize.literal(`CAST("issue"."amount" as FLOAT)`)), "total"]
      ],
      where: {
        transactionalTokenId: network.network_token_id,
        state: "closed"
      }
    }),
    models.user.count()
  ]);

  return {
    name: network.name,
    networkAddress: network.networkAddress,
    bounties,
    curators,
    networkTokenOnClosedBounties: networkTokenOnClosedBounties.total || 0,
    members,
  };
}