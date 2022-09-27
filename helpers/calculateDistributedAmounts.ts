import { Defaults } from "@taikai/dappkit";
import BigNumber from "bignumber.js";

const bigNumberPercentage = 
  (value1: BigNumber, value2: BigNumber) => value1.dividedBy(value2).multipliedBy(100).toFixed(2);


export default function calculateDistributedAmounts(treasury,
                                                    mergerFee: number,
                                                    proposerFee: number,
                                                    bountyAmount: BigNumber,
                                                    proposalPercents: number[]) {
  let treasuryAmount = BigNumber(0);
  
  if (!treasury.treasury && treasury.treasury === Defaults.nativeZeroAddress)
    treasuryAmount = bountyAmount.dividedBy(100).multipliedBy(treasury.closeFee);

  const realAmount = bountyAmount.minus(treasuryAmount);

  const mergerAmount =  realAmount.dividedBy(100).multipliedBy(mergerFee);
  const proposerAmount = realAmount.minus(mergerAmount).dividedBy(100).multipliedBy(proposerFee);
  const amount = realAmount.minus(mergerAmount).minus(proposerAmount);

  return {
    treasuryAmount: {
      value: treasuryAmount.toString(),
      percentage: bigNumberPercentage(treasuryAmount, bountyAmount),
    },
    mergerAmount: {
      value: mergerAmount.toString(),
      percentage: bigNumberPercentage(mergerAmount, bountyAmount),
    },
    proposerAmount: {
      value: proposerAmount.toString(),
      percentage: bigNumberPercentage(proposerAmount, bountyAmount),
    },
    proposals: proposalPercents.map(percent => {
      const value = amount.dividedBy(100).multipliedBy(percent);

      return {
        value: value.toString(),
        percentage: bigNumberPercentage(value, bountyAmount),
      }
    }),
  };
}
