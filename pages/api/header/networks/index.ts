import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";


async function get(req: NextApiRequest, res: NextApiResponse) {

  const numberIssues = await models.issue.count({
    where: {
      state: {[Op.not]: "pending"}
    }
  });

  const numberNetworks = await models.network.count({});

  const headerInformation = await models.headerInformation.findAll({})

  if(!headerInformation)
    return res.status(404).json("Header information not found");

  return res.status(200).json({
    ...headerInformation[0].dataValues,
    bounties: numberIssues,
    number_of_network: numberNetworks,
  });
}

async function SearchNetworks(req: NextApiRequest,
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
export default withCors(SearchNetworks)