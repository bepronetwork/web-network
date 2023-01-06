import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { WhereOptions } from "sequelize";

import models from "db/models";

import { calculateLeaderboardScore } from "helpers/leaderboard-score";
import paginate, { calculateTotalPages } from "helpers/paginate";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const whereCondition: WhereOptions = {};

    const { address, page, order, sortBy } = req.query || {};

    if (address) whereCondition.address = address;
    
    const leaderboard = await models.leaderBoard.findAndCountAll(paginate({
      attributes: {
        exclude: ["id"],
      },
      where: whereCondition,
      nest: true,
      raw: true
    }, req.query, [[sortBy || "numberNfts", order || "DESC"]]))
      .then(async (items) => {
        return Promise.all(items.rows.map(async (item) => {
          const user = await models.user.findOne({
              where: { address: item.address.toLowerCase() },
          });
          
          return {
            ...item,
            githubHandle: user?.githubHandle,
            ...calculateLeaderboardScore(item)
          };
        }))
          .then((values) => ({ count: items.count, rows: values }))
          .catch(() => items);
      });
      
    return res.status(200).json({
      ...leaderboard,
      currentPage: +page || 1,
      pages: calculateTotalPages(leaderboard.count),
    });
  } catch (e) {
    console.error(e);
    return res.status(500);
  }
}

async function SearchLeaderBoardPoints(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default withCors(SearchLeaderBoardPoints);
