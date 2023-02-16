import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";
import {LogAccess} from "../../../../middleware/log-access";
import WithCors from "../../../../middleware/withCors";


async function get(req: NextApiRequest, res: NextApiResponse) {
  const headerInformation = await models.headerInformation.findAll({})

  if(!headerInformation)
    return res.status(404).json({ message: "Header information not found" });

  return res.status(200).json(headerInformation[0]);
}

async function SearchNetworks(req: NextApiRequest,
                              res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
    break;
  }

  res.end();
}
export default LogAccess(WithCors(SearchNetworks))