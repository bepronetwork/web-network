import Database from "db/models";

//
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
    if(type === "transactional") networkToken.isTransactional = type === "transactional"
    else if(type === "reward") networkToken.isReward = type === "reward"
    await networkToken.save();
  }
}

//
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


