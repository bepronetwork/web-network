import {NextApiRequest, NextApiResponse} from "next";
import {Op, Sequelize} from "sequelize";

import Database from "db/models";

export default async function Count(req: NextApiRequest, res: NextApiResponse) {

  const result = await Database.network.findAll({
    include: [
      { association: "tokens" },
      {association: 'curators', attributes: [] },
      {association: 'issues', attributes: [], where: {state: {[Op.ne]: 'pending'}}},
    ],
    attributes: [
      "network.id",
      [Sequelize.fn('sum', Sequelize.cast(Sequelize.col('curators.tokensLocked'), 'int')), 'tokensLocked'],
      [Sequelize.fn('count', Sequelize.col('issues.id')), 'totalIssues'],
      // create new association `openIssues`
      // [Sequelize.fn('count', Sequelize.col('openIssues.id')), 'openIssues'],
    ],
    group: ['network.id', 'tokens->network_tokens.id', 'tokens.id'],
    where: {
      isRegistered: true,
      isClosed: false,
    },

  });

  res.status(200).json(result);
  return res.end();
}