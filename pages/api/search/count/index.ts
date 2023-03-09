import Database from "db/models";
import {Op, Sequelize} from "sequelize";
import {NextApiRequest, NextApiResponse} from "next";

export default async function Count(req: NextApiRequest, res: NextApiResponse) {

  // add this to associations (allIssues, openIssues)
  const issues_exclude = ['id', 'githubId', 'title', 'branch', 'network_id', 'contractId', 'creatorAddress', 'state', 'creatorGithub', 'amount', 'fundingAmount', 'fundedAmount', 'repository_id', 'body', 'working', 'merged', 'seoImage', 'tokenId', 'fundedAt', 'tags', 'isKyc', 'kycTierList', 'createdAt', 'updatedAt']

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