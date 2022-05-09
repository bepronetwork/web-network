import { Defaults } from "@taikai/dappkit";

import { BeproService } from "services/bepro-service";


export default async function calculateDistributedAmounts(bountyAmount: number, proposalPercents: number[]) {
  const treasury = await BeproService.network.treasuryInfo();
  
  const treasuryAmount =
    treasury["0"] === Defaults.nativeZeroAddress
      ? 0
      : (bountyAmount / 100) * (treasury["1"] / Defaults.TenK);
  const mergerAmount =
    (bountyAmount / 100) * (await BeproService.network.mergeCreatorFeeShare());
  const proposerAmount =
    ((bountyAmount - mergerAmount) / 100) * (await BeproService.network.proposerFeeShare());
  const amount = bountyAmount - treasuryAmount - mergerAmount - proposerAmount;

  return {
    treasuryAmount,
    mergerAmount,
    proposerAmount,
    proposals: proposalPercents.map((percent) => (amount / 100) * percent),
  };
}
