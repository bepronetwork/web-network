import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";

import findUserBySession from "helpers/query/findUserBySession";

import { withCORS } from "middleware";

import { kycApi } from "services/api";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { asNewSession } = req.query

    let kycSession = {}

    const user = await findUserBySession(req);

    if(!user)
      return res.status(404).send('User not found')

    kycSession = await models.kycSession.findOne({
       where:{
          user_id: user.id,
       }
    })
    
    if(!kycSession || asNewSession){
      const {data} = await kycApi.post('/session/init');
      kycSession = await models.kycSession.create({
        user_id: user.id,
        session_id: data.session_id,
        status: "PENDING",
      })
    }

    return res.status(200).json(kycSession);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function KycInit(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCORS(KycInit);