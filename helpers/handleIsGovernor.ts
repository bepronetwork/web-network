import { IncomingHttpHeaders } from "http";
import { Op } from "sequelize";

import models from "db/models";

import { IM_AM_CREATOR_NETWORK } from "./constants";
import decodeMessage from "./decode-message";

export async function isGovernorSigned(headers: IncomingHttpHeaders) {
  const wallet = (headers.wallet as string)?.toLowerCase();
  const chainId = headers.chain as string;
  if (wallet && chainId) {
    const network = await models.network.findOne({
      where: {
        creatorAddress: { [Op.iLike]: wallet },
        chain_id: chainId,
      },
    });

    if (network) {
      if (wallet?.toLowerCase() === network?.creatorAddress?.toLowerCase()) {
        const signature = headers.signature as string;
        if (
          signature &&
          decodeMessage(chainId,
                        IM_AM_CREATOR_NETWORK,
                        signature,
                        network?.creatorAddress)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}
