import * as Logging from "@scripts/logging"
import { NetworkRegistry, Network_v2 } from "@taikai/dappkit";

import models from "db/models";

export default async function readNetworkRegistered(events, network: Network_v2, registry: NetworkRegistry) {
  const networksRegistered = [];

  for (const event of events) {
    const { network: networkAddress, creator: creatorAddress, id } = event.returnValues;

    try {
      const network = await models.network.findOne({
        where: {
          networkAddress
        }
      });

      if (!network) {
        Logging.log("Failed to read network registered event", { 
          reason: "Network not found on database", 
          networkAddress, 
          creatorAddress, 
          id
        });

        continue;
      } else if (network.registered) {
        Logging.log("Failed to read network registered event", { 
          reason: "Network already registered",
          networkAddress, 
          creatorAddress, 
          id
        });

        continue;
      } else if (network.creatorAddress !== creatorAddress) {
        Logging.log("Failed to read network registered event", { 
          reason: "Network creator mismatch", 
          networkAddress, 
          contractCreatorAddress: creatorAddress, 
          databseCreatorAddress: network.creatorAddress,
          id
        });

        continue;
      }

      network.isRegistered = true;
      await network.save();

      networksRegistered.push(networkAddress);
    } catch(error) {
      Logging.error("Failed to read network registered event", { event, error });
    }
  }

  return networksRegistered;
}