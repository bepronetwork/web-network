
import { ERC20, fromSmartContractDecimals, Network_v2 } from "@taikai/dappkit";

import models from "db/models";

export default async function readBountyCreated(events, network: Network_v2, customNetwork) {
  const createdBounties: string[] = [];

  for(const event of events) {
    const { id, cid } = event.returnValues;

    try {

      const bounty = await models.issue.findOne({
        where: {
          issueId: cid,
          network_id: customNetwork.id
        }
      });
      
      if (bounty) {
        if (bounty.state !== "pending")
          console.warn(`[DUPLICATED_BOUNTY] ${cid} is not a pre-bounty. Verify if this block is being readed again.`);
        else {
          const networkBounty = await network.getBounty(id);

          bounty.state = 'draft';
          bounty.creatorAddress = networkBounty.creator;
          bounty.creatorGithub = networkBounty.githubUser;
          bounty.amount = fromSmartContractDecimals(networkBounty.tokenAmount);
          bounty.branch = networkBounty.branch;
          bounty.title = networkBounty.title;
          bounty.contractId = id;

          await bounty.save();

          createdBounties.push(cid);

          const token = await models.tokens.findOne({
            where: {
              address: networkBounty.transactional
            }
          });

          if (token) bounty.tokenId = token.id;
          else {
            const erc20 = new ERC20(network.connection, networkBounty.transactional);

            await erc20.loadContract();

            const tokenId = await models.tokens.create({
              name: await erc20.name(),
              symbol: await erc20.symbol(),
              address: networkBounty.transactional
            });

            bounty.tokenId = tokenId;
          }

          await bounty.save();
        }
      }
    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${cid} from past-events`, event, error);
    }
  }

  return createdBounties;
}