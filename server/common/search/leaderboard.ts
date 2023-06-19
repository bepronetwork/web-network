import { ParsedUrlQuery } from "querystring";
import { Op, Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import paginate, { DEFAULT_ITEMS_PER_PAGE, calculateTotalPages } from "helpers/paginate";

export default async function get(query: ParsedUrlQuery) {
  const {
    address,
    page,
    search,
    sortBy,
    order
  } = query;

  const whereCondition: WhereOptions = {};

  if (address) whereCondition.address = address;

  const whereInclude = search ? {
    [Op.or]: [
      { address: { [Op.iLike]: `%${search}%` } },
      { githubLogin: { [Op.iLike]: `%${search}%` } },
    ]
  }  : {};
  
  const PAGE = +(page || 1);

  const leaderboard = await models.leaderBoard.findAndCountAll(paginate({
    attributes: {
      exclude: ["id"]
    },
    where: whereCondition,
    include: [
      {
        association: "user",
        attributes: ["githubLogin"],
        required: !!search,
        on: Sequelize.where(Sequelize.fn("lower", Sequelize.col("user.address")),
                            "=",
                            Sequelize.fn("lower", Sequelize.col("leaderboard.address"))),
        where: whereInclude
      }
    ]
  }, { page: PAGE },  [[sortBy || "numberNfts", order || "DESC"]]));

  return {
    ...leaderboard,
    currentPage: PAGE,
    pages: calculateTotalPages(leaderboard.count, DEFAULT_ITEMS_PER_PAGE)
  };
}