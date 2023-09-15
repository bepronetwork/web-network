import { ParsedUrlQuery } from "querystring";
import { Sequelize } from "sequelize";

import models from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";
import { getAssociation } from "helpers/db/models";

import { HttpNotFoundError } from "server/errors/http-errors";

export default async function get(query: ParsedUrlQuery) {
  const {
    id,
    network,
    chain,
  } = query;

  if (!id|| !network || !chain)
    throw new HttpNotFoundError("Missing parameters");

  const proposal = await models.mergeProposal.findOne({
    where: {
      id: id
    },
    include: [
      getAssociation("disputes"),
      getAssociation("distributions", ["recipient", "percentage"], true, undefined, [
        getAssociation( "user",
                        ["githubLogin"],
                        false,
                        undefined,
                        undefined, 
                        Sequelize.where(Sequelize.fn("lower", Sequelize.col("distributions.user.address")),
                                        "=",
                                        Sequelize.fn("lower", Sequelize.col("distributions.recipient"))))
      ]),
      getAssociation("deliverable"),
      getAssociation("issue", undefined, true, undefined, [
        getAssociation("transactionalToken", ["name", "symbol"]),
      ]),
      getAssociation("network", [], true, {
        name: caseInsensitiveEqual("network.name", network?.toString())
      }, [
        getAssociation("chain", [], true, {
          chainShortName: caseInsensitiveEqual("network.chain.chainShortName", chain?.toString())
        })
      ]),
    ]
  });

  if (!proposal)
    throw new HttpNotFoundError("Proposal not found");

  return proposal;
}