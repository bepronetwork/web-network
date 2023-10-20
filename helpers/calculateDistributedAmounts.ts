import {Defaults, ProposalDetail} from "@taikai/dappkit";
import BigNumber from "bignumber.js";

import {DistributedAmounts, ProposalDistribution} from "interfaces/proposal";

const bigNumberPercentage = 
  (value1: BigNumber, value2: BigNumber) => value1.dividedBy(value2).multipliedBy(100).toFixed(2);


export default function calculateDistributedAmounts(treasury,
                                                    mergerFee: string | number,
                                                    proposerFee: string | number,
                                                    bountyAmount: BigNumber,
                                                    proposalPercents: ProposalDetail[] | ProposalDistribution[]): 
                                                    DistributedAmounts {
  let treasuryAmount = BigNumber(0);
  
  if (treasury.treasury && treasury.treasury !== Defaults.nativeZeroAddress)
    treasuryAmount = bountyAmount.dividedBy(100).multipliedBy(treasury.closeFee);

  const realAmount = bountyAmount.minus(treasuryAmount);

  const mergerAmount =  realAmount.dividedBy(100).multipliedBy(mergerFee);
  const proposerAmount = realAmount.minus(mergerAmount).dividedBy(100).multipliedBy(proposerFee);
  const amount = realAmount.minus(mergerAmount).minus(proposerAmount);

  return {
    treasuryAmount: {
      value: treasuryAmount.toFixed(),
      percentage: bigNumberPercentage(treasuryAmount, bountyAmount),
    },
    mergerAmount: {
      value: mergerAmount.toFixed(),
      percentage: bigNumberPercentage(mergerAmount, bountyAmount),
    },
    proposerAmount: {
      value: proposerAmount.toFixed(),
      percentage: bigNumberPercentage(proposerAmount, bountyAmount),
    },
    proposals: proposalPercents.map(({percentage, recipient}) => {
      const value = amount.dividedBy(100).multipliedBy(percentage);
      return {
        value: value.toFixed(),
        recipient,
        percentage: bigNumberPercentage(value, bountyAmount),
      }
    }),
  };
}

export function getDeveloperAmount( mergerFee: string | number,
                                    proposerFee: string | number,
                                    bountyAmount: BigNumber): string {
  const distributedAmounts = calculateDistributedAmounts( { treasury: "0x123", closeFee: 10 },
                                                          mergerFee, 
                                                          proposerFee, 
                                                          bountyAmount, 
                                                          [{recipient: "0x00", percentage: 100}]);
  return distributedAmounts?.proposals?.at(0)?.value;
}

export function calculateTotalAmountFromGivenReward(reward: number,
                                                    networkFee: number,
                                                    mergerFee: number,
                                                    proposerFee: number) {
  const _reward = BigNumber(reward);
  const _networkFee = BigNumber(networkFee);
  const _mergerFee = BigNumber(mergerFee);
  const _proposerFee = BigNumber(proposerFee);
  const _one = BigNumber(1);

  return _reward.div(_one
    .minus(_networkFee)
    .minus(_one
      .minus(_networkFee)
      .times(_mergerFee))
    .minus(_one
      .minus(_networkFee)
      .minus(_one
        .minus(_networkFee)
        .times(_mergerFee))
      .times(_proposerFee)));
}