import { Token } from "interfaces/token";

export function handleAllowedTokensDatabase(allowedTokens: {
    transactional: string[];
    reward: string[];
  },
                                            tokens: Token[]): { transactional: Token[]; reward: Token[] } {
  return {
    transactional: allowedTokens.transactional
      ?.map((transactionalToken) => {
        return tokens.find((token) =>
            token.address === transactionalToken &&
            token.isTransactional === true);
      })
      .filter((v) => v),

    reward: allowedTokens.reward
      ?.map((rewardToken) => {
        return tokens.find((token) =>
            token.address === rewardToken && token.isTransactional === false);
      })
      .filter((v) => v),
  };
}
