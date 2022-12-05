import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";

import { kycApi } from "services/api";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const {tier, githubLogin} = req?.body
    
    // const user = await models.user.findOne({
    //   where: { 
    //     githubLogin
    //   },
    //   raw: true
    // })

    const {data} = await kycApi.post('/session/init')
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
}

export default async function GetIssues(req: NextApiRequest,
                                        res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
