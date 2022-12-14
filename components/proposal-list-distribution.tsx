import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import BountyDistributionItem from "components/bounty-distribution-item";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";

import {ProposalExtended} from "interfaces/bounty";
import {TokenInfo} from "interfaces/token";

import {getCoinInfoByContract} from "services/coingecko";

import {useAppState} from "../contexts/app-state";


interface amount {
  value: string;
  percentage: string;
}

interface distributedAmounts {
  treasuryAmount: amount;
  mergerAmount: amount;
  proposerAmount: amount;
  proposals: amount[];
}

interface props {
  proposal: ProposalExtended;
}

const defaultAmount = {
  value: "0",
  percentage: "0",
};


export default function ProposalListDistribution({proposal}: props) {
  const { t } = useTranslation(["common", "proposal"]);

  const [coinInfo, setCoinInfo] = useState<TokenInfo>()
  const [distributedAmounts, setDistributedAmounts] =
    useState<distributedAmounts>({
      treasuryAmount: defaultAmount,
      mergerAmount: defaultAmount,
      proposerAmount: defaultAmount,
      proposals: [defaultAmount],
    });
  
  const {state} = useAppState();

  const amountTotal = 
    BigNumber.maximum(state.currentBounty?.data?.amount || 0, state.currentBounty?.data?.fundingAmount || 0);

  async function getDistributedAmounts() {
    if (!proposal?.details) return;
    
    const { treasury, mergeCreatorFeeShare, proposerFeeShare } = state.Service.network.amounts;

    const distributions = calculateDistributedAmounts(treasury,
                                                      mergeCreatorFeeShare,
                                                      proposerFeeShare,
                                                      amountTotal,
                                                      proposal.details.map(({ percentage }) => percentage));
    setDistributedAmounts(distributions);
  }

  async function  getCoinInfo() { 
    await getCoinInfoByContract(state.Service?.network?.networkToken?.symbol).then((tokenInfo) => {
      setCoinInfo(tokenInfo)
    }).catch(error => console.debug("getCoinInfo", error));
  }

  function handleConversion(value) {
    return BigNumber(value).multipliedBy(coinInfo?.prices[state.Settings?.currency?.defaultFiat]).toFixed(4);
  }

  const currentTokenSymbol = state.currentBounty?.data?.token?.symbol  ||  t("common:misc.token")

  useEffect(() => {
    if (!proposal || !state.Service?.network?.amounts)
      return;
    getDistributedAmounts();
    getCoinInfo()
  }, [proposal, state.Service?.network?.amounts]);


  return (
    <ul className="mb-0 bg-dark-gray rounded-3 px-1 py-2">
        <BountyDistributionItem
            name={t("proposal:merge-modal.network-fee")}
            description={t("proposal:merge-modal.network-fee-description", {
              percentage: distributedAmounts.treasuryAmount.percentage,
            })}
            percentage={distributedAmounts.treasuryAmount.percentage}
            symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
            line={true}
            amounts={[distributedAmounts.treasuryAmount.value, 
                      handleConversion(distributedAmounts.treasuryAmount.value)]}
          />
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-merger")}
            description={t("proposal:merge-modal.proposal-merger-description")}
            percentage={distributedAmounts.mergerAmount.percentage}
            symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
            line={true}
            amounts={[distributedAmounts.mergerAmount.value, 
                      handleConversion(distributedAmounts.mergerAmount.value)]}
          />
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-creator")}
            description={t("proposal:merge-modal.proposal-creator-description")}
            percentage={distributedAmounts.proposerAmount.percentage}
            symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
            line={true}
            amounts={[distributedAmounts.proposerAmount.value, 
                      handleConversion(distributedAmounts.proposerAmount.value)]}
          />
          {distributedAmounts?.proposals?.map((item, key) => (
            <BountyDistributionItem
              name={t("proposal:merge-modal.contributor", {
                count: key + 1,
              })}
              description={t("proposal:merge-modal.contributor-description")}
              percentage={item.percentage}
              symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
              line={key !== ((distributedAmounts?.proposals?.length || 0 ) - 1)}
              amounts={[item.value, handleConversion(item.value)]}
              key={key}
            />
          ))}
        </ul>
  );
}
