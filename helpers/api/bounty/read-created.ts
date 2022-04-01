
import { fromSmartContractDecimals, Network_v2 } from "bepro-js";

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
        }
      }
    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${cid} from past-events`, event, error);
    }
  }

  return createdBounties;
}