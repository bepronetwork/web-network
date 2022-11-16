import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

import paginate, {calculateTotalPages, paginateArray} from "helpers/paginate";
import { searchPatternInText } from "helpers/string";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const whereCondition: WhereOptions = {};

    const {address, isCurrentlyCurator, networkName, search, page } = req.query || {};

    if (networkName) {
      const network = await models.network.findOne({
        where: {
        name: {
            [Op.iLike]: String(networkName)
        }
        }
      });

      if (!network) return res.status(404).json("Invalid network");

      whereCondition.networkId = network?.id;
    }

    if (address) whereCondition.address = address;

    if (isCurrentlyCurator) whereCondition.isCurrentlyCurator = isCurrentlyCurator;

    if (search) {
      const curators = await models.curator.findAll({
            where: whereCondition,
            nest: true,
            order: [[req.query.sortBy || "createdAt", req.query.order || "DESC"]]
      });

      const result = [];

      result.push(...curators.filter(({ title, body }) =>
            [title, body].some((text) =>
                searchPatternInText(text || "", String(search)))));

      const paginatedData = paginateArray(result, 10, page || 1);

      return res.status(200).json({
            count: result.length,
            rows: paginatedData.data,
            pages: paginatedData.pages,
            currentPage: +paginatedData.page
      });
    } else {
      const curators = await models.curator.findAndCountAll(paginate({
                attributes: {
                exclude: ["id"]
                },
                where: whereCondition,
                nest: true
      },
                                                                     req.query,
            [[req.query.sortBy || "createdAt", req.query.order || "DESC"]]));

      return res.status(200).json({
                ...curators,
                currentPage: +page || 1,
                pages: calculateTotalPages(curators.count)
      });
    } 
  }catch(e){
    console.error(e)
    return res.status(500)
  }
}

async function SearchCurators(req: NextApiRequest,
                              res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default withCors(SearchCurators)