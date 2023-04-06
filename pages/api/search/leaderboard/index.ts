import {subHours, subMonths, subWeeks, subYears} from "date-fns";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages, paginateArray} from "helpers/paginate";
import {searchPatternInText} from "helpers/string";

import {LogAccess} from "middleware/log-access";
import WithCors from "middleware/withCors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const whereCondition: WhereOptions = {};

    const { address, page, time, search } = req.query || {};

    if (address) whereCondition.address = address;

    if (time) {
      let fn;
      if (time === "week") fn = subWeeks;
      if (time === "month") fn = subMonths;
      if (time === "year") fn = subYears;
      if (time === "hour") fn = subHours;

      if (!fn) return res.status(422).json("Unable to parse date");

      whereCondition.createdAt = { [Op.gt]: fn(+new Date(), 1) };
    }
    
    if (search) {
      const leaderboard = await models.leaderBoard.findAll({
          where: whereCondition,
          nest: true,
          order: [[(req.query.sortBy  || ["numberNfts"]), req.query.order || "DESC"]]
      })
        .then(async (items) => {
          return Promise.all(items.map(async (item) => {
            const user = await models.user.findOne({
                where: { address: item.address.toLowerCase() },
            });
            item.dataValues.githubLogin = user?.githubLogin || null;
            return item;
          }))
            .then((values) => values)
            .catch(() => items);
        });

      const result = [];

      result.push(...leaderboard.filter(({ address, dataValues }) =>
          [address, dataValues?.githubLogin].some((text) =>
            searchPatternInText(text || "", String(search)))));

      const paginatedData = paginateArray(result, 10, page || 1);

      return res.status(200).json({
        count: result.length,
        rows: paginatedData.data,
        pages: paginatedData.pages,
        currentPage: +paginatedData.page,
      });
    } else {
      const leaderboard = await models.leaderBoard
        .findAndCountAll(paginate({
              attributes: {
                exclude: ["id"],
              },
              where: whereCondition,
              nest: true,
        },
                                  req.query,
            [[req.query.sortBy || "numberNfts", req.query.order || "DESC"]]))
        .then(async (items) => {
          return Promise.all(items.rows.map(async (item) => {
            const user = await models.user.findOne({
                where: { address: item.address.toLowerCase() },
            });

            item.dataValues.githubLogin = user?.githubLogin || null;
            
            return item;
          }))
            .then((values) => ({ count: items.count, rows: values }))
            .catch(() => items);
        });
        
      return res.status(200).json({
        ...leaderboard,
        currentPage: +page || 1,
        pages: calculateTotalPages(leaderboard.count),
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500);
  }
}

async function SearchLeaderBoard(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default LogAccess(WithCors(SearchLeaderBoard));
