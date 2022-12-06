import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import getConfig from "next/config";

import models from "db/models";

import { kycApi } from "services/api";

const {serverRuntimeConfig} = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req }) as any;
    
    if(!session.user.login)
      return res.status(500).json('User Session not found')
    
    const {tier} = req.query
    const {session_id} = req.headers

    const user = await models.user.findOne({
      where: { 
        githubLogin: session.user.login
      },
      raw: true
    })

    const kycSession = await models.kycSession.findOne({
       where:{
          user_id: user.id,
          tier: tier || serverRuntimeConfig.kyc.defaultTier,
          session_id
       }
    })
    
    if(!kycSession.validatedAt){
      const {data} = await kycApi.get('/session/info',{
        headers:{
          'Session-Id': kycSession.session_id
        }
      })
  
      kycSession.status = data.status;

      if(data.status === 'VERIFIED')
        kycSession.validatedAt = new Date();

      kycSession.save();
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
