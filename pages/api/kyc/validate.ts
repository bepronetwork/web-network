import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";

import findUserBySession from 'helpers/query/findUserBySession';

import { withCORS } from "middleware";

import { kycApi } from "services/api";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { session_id } = req.headers

    const user = await findUserBySession(req)

    if(!user)
      return res.status(404).send('User not found')

    const kycSession = await models.kycSession.findOne({
       where:{
          user_id: user.id,
          session_id
       }
    })
    
    if(!kycSession)
      return res.status(404).send('KYC Session not found')

    if(!kycSession?.validatedAt){
      const {data} = await kycApi.get('/onboarding/overview',{
        headers:{
          'Session-Id': kycSession.session_id
        }
      })
      
      kycSession.steps = data.steps;
      
      if(data.session.status !== kycSession.status){
        kycSession.status = data.session.status

        if(data.session.status === 'VERIFIED')
          kycSession.validatedAt = new Date();
      }

      kycSession.save();
    }

    return res.status(200).json(kycSession);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function KycValidate(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCORS(KycValidate);