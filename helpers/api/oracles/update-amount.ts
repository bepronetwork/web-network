import { Network_v2, fromSmartContractDecimals } from "@taikai/dappkit";

import models from "db/models";
export default async function updateOraclesAmount(events, network: Network_v2) {

  const _network = await models.network.findOne({
    where: {
      networkAddress: String(network?.contractAddress)
    }
  })

  if (!_network) return console.warn("Network not found in the database", network?.contractAddress);

  const councilAmount = await network.councilAmount();
  const existing_members = [...(_network.councilMembers || [])];
  const remove_members = [];

  try {
    for (const event of events) {
      const { newLockedTotal, actor } = event.returnValues;
      const newTotal = fromSmartContractDecimals(newLockedTotal)
      if (newTotal >= councilAmount && !existing_members.includes(actor))
        existing_members.push(actor)
      else if (newTotal < councilAmount && existing_members.includes(actor))
        remove_members.push(actor);
    }

    const new_members = existing_members
      .filter((address) => !remove_members.includes(address))
      
    _network.councilMembers = new_members
    await _network.save();
  } catch (error) {
    console.error(error)
  }
  return existing_members;
}