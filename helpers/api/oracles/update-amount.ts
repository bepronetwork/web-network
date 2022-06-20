import { Network_v2, fromSmartContractDecimals } from "@taikai/dappkit";

import models from "db/models";
export default async function updateAmount(events, network: Network_v2, customNetwork) {
  const created = [];

  const _network = await models.network.findOne({
    where: {
      networkAddress: String(network?.contractAddress)
    }
  })

  if (!network) return console.warn("Network not found in the database", network?.contractAddress);


  try {
    for (const event of events) {
      const { newLockedTotal, actor } = event.returnValues;
      const councilAmount = +fromSmartContractDecimals(newLockedTotal) > (await network?.councilAmount());
      const isCouncil = _network?.councilMembers?.find(adr => adr === String(actor));
      if (councilAmount && !isCouncil) {
        _network.councilMembers = [...(_network?.councilMembers || []), String(actor)]
      } else if (isCouncil && !councilAmount) {
        _network.councilMembers = _network.councilMembers.filter(adr => adr !== String(actor))
      }
    }
    await _network.save();
  } catch (error) {
    console.error(error)
  }
  return created;
}