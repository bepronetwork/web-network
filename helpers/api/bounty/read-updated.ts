
import { Network_v2 } from "@taikai/dappkit";

import models from "db/models";

export default async function readBountyUpdated(events, network: Network_v2, customNetwork) {
  const updatedBounties: string[] = [];

  for(const event of events) {
    const { id } = event.returnValues;

    try {
      const networkBounty = await network.getBounty(id);

      if (networkBounty) {
        const bounty = await models.issue.findOne({
          where: {
            issueId: networkBounty.cid,
            contractId: networkBounty.id,
            creatorAddress: networkBounty.creator,
            creatorGithub: networkBounty.githubUser,
            network_id: customNetwork.id
          }
        });
        
        if (bounty) {
          bounty.amount = networkBounty.tokenAmount;

          await bounty.save();

          updatedBounties.push(networkBounty.cid);
        } else console.warn("Bounty not found in the database", id, customNetwork.name);
      } else console.warn("Bounty not found in the network", id, customNetwork.name);
    } catch (error) {
      console.error(`[ERROR_BOUNTY] Failed to save ${id} from past-events`, event, error);
    }
  }

  return updatedBounties;
}