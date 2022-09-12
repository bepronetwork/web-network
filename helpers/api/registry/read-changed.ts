
import { ERC20, NetworkRegistry, Network_v2 } from "@taikai/dappkit";

import models from "db/models";

export default async function readTokenChanged(events, network: Network_v2, registry: NetworkRegistry) {
  const updatedToken: string[] = [];

  for(const event of events) {
    const { tokens, operation, kind } = event.returnValues;

    try {
      const allowedTokens = await registry.getAllowedTokens()
      const databaseTokens = await models.tokens.findAll() || []


      if(allowedTokens){
        if(operation === 'add'){
          const addTokens = tokens?.map(address => {
            const valid = allowedTokens?.[kind]?.find(kindAddress => kindAddress === address)
            if(valid) {
              const isDatabase = databaseTokens?.find(token => token.address === address)
              if(!isDatabase) return address
            }
          }).filter(v => v)

          if(addTokens.length > 0){
            for (const address of addTokens) {
              
              const erc20 = new ERC20(registry.web3Connection, address);

              await erc20.loadContract();

              const token =  {
                name: await erc20.name(),
                symbol: await erc20.symbol(),
                address: address
              };
              
              await models.tokens.create({...token, isTransactional: kind === 'transactional' ? true : false})
            }
          }
        }else if(operation === 'remove'){
          const removeTokens = tokens?.map(address => {
            const valid = allowedTokens?.[kind]?.find(kindAddress => kindAddress === address)
            if(!valid) {
              const isDatabase = databaseTokens?.find(token => token.address === address)
              if(isDatabase) return address
            }
          }).filter(v => v)

          if(removeTokens.length > 0) {
            for (const address of removeTokens) {
              const token = await models.tokens.findOne({
                  where: {
                    address: address,
                    isTransactional: kind === 'transactional' ? true : false,
                  }
              });
              
              if (token) await models.networkTokens.destroy({ where : { tokenId: token.id }})
              .catch(() => console.log('Error synchronizing token deletion'))
            }
          }
        }
      }else console.warn("Allowed tokens not found in the registry");

      console.log('deu bom')
    } catch (error) {
      console.error(`[ERROR_REGISTRY] Failed to save tokens from past-events`, event, error);
    }
  }

  return updatedToken;
}