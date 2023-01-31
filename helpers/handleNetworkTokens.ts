import Database from "db/models";

//checks if it exists in the base, creates it if necessary and if it exists, adds the boolean for the correct value
export const handlefindOrCreateTokens = async (tokenId: number,
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
    if(type === "transactional") 
      networkToken.isTransactional = true
    else if(type === "reward") 
      networkToken.isReward = true
  
    await networkToken.save();
  }
}

//anticipates the need to remove if both conditions are false. and changes the condition of a column to false if both are true.
export async function handleRemoveTokens(allowedTokens,
                                         token,
                                         type: "transactional" | "reward") {
  if (!allowedTokens.find((id) => id === token.tokenId)) {
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


