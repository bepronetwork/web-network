import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";

import models from "db/models";

import { kycApi } from "services/api";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {

    const session = await getSession({ req }) as any;
    const { asNewSession } = req.query
    let kycSession = {}

    if(!session.user.login)
      return res.status(500).json('User Session not found')
    
    const user = await models.user.findOne({
      where: { 
        githubLogin: session.user.login
      },
      raw: true
    })

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
      })
    }

    return res.status(200).json(kycSession);
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