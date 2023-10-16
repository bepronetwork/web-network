import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import {calculateLeaderboardScore} from "helpers/leaderboard-score";
import paginate, {calculateTotalPages} from "helpers/paginate";

import { withCORS } from "middleware";

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
    }, req.query, [[sortBy || "numberNfts", order || "DESC"]]));

    const users = await models.user.findAll({
      where: { 
        address: {
          [Op.in]: leaderboard.rows.map(({ address }) => address.toLowerCase())
        }
      },
    });

    const leaderBoardWithPoints = {
      ...leaderboard,
      rows: leaderboard.rows.map(row => ({
        ...row,
        githubLogin: users.find(({ address }) => address.toLowerCase() === row.address.toLowerCase())?.githubLogin,
        ...calculateLeaderboardScore(row)
      }))
    };
      
    return res.status(200).json({
      ...leaderBoardWithPoints,
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
export default withCORS(SearchLeaderBoardPoints);
