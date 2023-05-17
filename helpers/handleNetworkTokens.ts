import { Web3Connection } from "@taikai/dappkit";
import { ERC20 } from "@taikai/dappkit";

import Database from "db/models";

//checks if it exists in the base, creates it if necessary and if it exists, adds the boolean for the correct value
const handlefindOrCreateTokens = async (tokenId: number,
  networkId: number,
  type: "transactional" | "reward") => {
  const [networkToken, created] = await Database.networkTokens.findOrCreate({
    where: {
      networkId: networkId,
      tokenId: tokenId,
    },
    defaults: {
      networkId,
      tokenId,
      isTransactional: type === "transactional",
      isReward: type === "reward",
    },
  });

  if (!created) {
    if (type === "transactional") networkToken.isTransactional = true;
    else if (type === "reward") networkToken.isReward = true;

    await networkToken.save();
  }
};

//anticipates the need to remove if both conditions are false. and changes the condition of a column to false if both are true.
async function handleRemoveTokens(allowedTokens,
                                  token,
                                  type: "transactional" | "reward") {
  const exist = (id) => id === token.tokenId;
  if (!allowedTokens.some(exist)) {
    if (
      (type === "transactional" && token.isReward === false) ||
      (type === "reward" && token.isTransactional === false)
    ) {
      await token.destroy();
    } else {
      if (type === "transactional") token.isTransactional = false;
      if (type === "reward") token.isReward = false;
      await token.save();
    }
  }
}

async function handleCreateSettlerToken(address: string,
                                        minAmount: string,
                                        chainRpc: string,
                                        chain_id: number) {

  const token = await Database.tokens.findOne({ where: {
    address: address,
    chain_id,
  }})

  if(token){
    token.minimum = minAmount
    await token.save()
    return token
  } else {
    const web3Connection = new Web3Connection({
      web3Host: chainRpc,
      skipWindowAssignment: true,
    });
  
    web3Connection.start()
  
    const erc20 = new ERC20(web3Connection, address);
  
    await erc20.loadContract();
  
    const name = await erc20.name();
    const symbol = await erc20.symbol();

    const newToken = await Database.tokens.create({
      address,
      name,
      symbol,
      chain_id,
      minimum: minAmount,
      isTransactional: false,
      isReward: false
    })

    return newToken
  } 
}

export {
  handlefindOrCreateTokens,
  handleRemoveTokens,
  handleCreateSettlerToken,
};
