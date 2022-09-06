import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";

import Database from "db/models";

import DAO from "services/dao-service";

async function get(req: NextApiRequest, res: NextApiResponse) {

  const DAOService = new DAO({ skipWindowAssignment: true });

  if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");

  const registry = await DAOService.loadRegistry(true)
  if (!registry) return res.status(500).json("Failed to load registry");

  const tokens = await Database.tokens.findAll();

  if(!tokens) return res.status(500).json("Error to get tokens from the database")

  const allowedTokens = await registry.getAllowedTokens()
  
  if(allowedTokens) {
    const addTransactionalTokens = []
    const removeTransactionalTokens = []
    const removeRewardTokens = []
    const addRewardTokens = []

    if(allowedTokens?.transactional?.length > 0) await allowedTokens?.transactional?.map((address) => {
      const valid = tokens?.find(token => token.address === address && token.isTransactional === true)
      if(!valid) addTransactionalTokens.push(address)
    })

    if(allowedTokens?.reward?.length > 0) await allowedTokens?.reward?.map((address) => {
      const valid = tokens?.find(token => token.address === address && token.isTransactional === false)
      if(!valid) addRewardTokens.push(address)
    })

    if(addTransactionalTokens.length > 0){
      for (const address of addTransactionalTokens) {
        const token = await DAOService.getERC20TokenData(address);
        await Database.tokens.create({...token, isTransactional: true})
      }
    }

    if(addRewardTokens.length > 0){
      for (const address of addRewardTokens) {
        const token = await DAOService.getERC20TokenData(address);
        await Database.tokens.create({...token, isTransactional: false})
      }
    }

    const newTokens = await Database.tokens.findAll();

    if(!newTokens) return res.status(500).json("Error to get new tokens from the database")

    await newTokens?.map(({address}) => {
      const validTransactional = allowedTokens?.transactional?.find(tAddress => tAddress === address)
      if(!validTransactional) removeTransactionalTokens.push(address)
  
      const validReward = allowedTokens?.reward?.find(rAddress => rAddress === address)
      if(!validReward) removeRewardTokens.push(address)
    })

    if(removeTransactionalTokens.length > 0) {
      for (const address of removeTransactionalTokens) {
        const exists = await Database.tokens.findOne({
            where: {
              address: address,
              isTransactional: true,
            }
        });
        if (exists) await exists.destroy().catch(() => console.log('Error synchronizing token deletion'))
      }
    }
    if(removeRewardTokens.length > 0) {
      for (const address of removeRewardTokens) {
        const exists = await Database.tokens.findOne({
              where: {
                address: address,
                isTransactional: false,
              }
        });
        if (exists) await exists.destroy().catch(() => console.log('Error synchronizing token deletion'))
      }
    }
  }


  return res.status(200).json("Update allowed tokens in database");
}

async function UpdateAllowedTokens(req: NextApiRequest,
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
export default withCors(UpdateAllowedTokens)