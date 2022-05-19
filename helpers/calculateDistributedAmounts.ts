import { Defaults } from "@taikai/dappkit";

import { handlePercentage } from "helpers/handlePercentage";

export default async function calculateDistributedAmounts(treasury,
                                                          mergerFee: number,
                                                          proposerFee: number,
                                                          bountyAmount: number,
                                                          proposalPercents: number[]) {
  const treasuryAmount = treasury["0"] === Defaults.nativeZeroAddress ? 0 : 
    (bountyAmount / 100) * (treasury["1"] / Defaults.TenK);

  const mergerAmount = (bountyAmount / 100) * mergerFee;
  const proposerAmount = ((bountyAmount - mergerAmount) / 100) * proposerFee;
  const amount = bountyAmount - treasuryAmount - mergerAmount - proposerAmount;

  return {
    treasuryAmount: {
      value: treasuryAmount,
      percentage: handlePercentage(treasuryAmount, bountyAmount),
    },
    mergerAmount: {
      value: mergerAmount,
      percentage: handlePercentage(mergerAmount, bountyAmount),
    },
    proposerAmount: {
      value: proposerAmount,
      percentage: handlePercentage(proposerAmount, bountyAmount),
    },
    proposals: proposalPercents.map((percent) => {
      return {
        value: (amount / 100) * percent,
        percentage: handlePercentage((amount / 100) * percent, bountyAmount),
      };
    }),
  };
}
