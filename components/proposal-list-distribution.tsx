import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import BountyDistributionItem from "components/bounty-distribution-item";

import { useAppState } from "contexts/app-state";

import { truncateAddress } from "helpers/truncate-address";

import { DistributedAmounts } from "interfaces/proposal";
import { TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

interface Props {
  distributedAmounts: DistributedAmounts;
}

export default function ProposalListDistribution({
  distributedAmounts,
}: Props) {
  const { t } = useTranslation(["common", "proposal"]);

  const [coinInfo, setCoinInfo] = useState<TokenInfo>();

  const { state } = useAppState();

  async function getCoinInfo() {
    await getCoinInfoByContract(state.Service?.network?.active?.networkToken?.symbol)
      .then((tokenInfo) => {
        setCoinInfo(tokenInfo);
      })
      .catch((error) => console.debug("getCoinInfo", error));
  }

  const handleConversion = (value) =>
    BigNumber(value)
      .multipliedBy(coinInfo?.prices[state.Settings?.currency?.defaultFiat])
      .toFixed(4);

  const currentTokenSymbol =
    state.currentBounty?.data?.transactionalToken?.symbol || t("common:misc.token");

  useEffect(() => {
    if (state.Service?.network?.amounts) getCoinInfo();
  }, [state.Service?.network?.amounts]);

  return (
    <ul className="d-flex flex-column gap-px-1">
      {distributedAmounts?.proposals?.map((item, key) => (
        <BountyDistributionItem
          name={truncateAddress(item?.recipient)}
          githubLogin={item?.githubLogin}
          description={t("proposal:merge-modal.contributor-description")}
          percentage={item.percentage}
          symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
          line={key !== (distributedAmounts?.proposals?.length || 0) - 1}
          amounts={[item.value, handleConversion(item.value)]}
          key={key}
        />
      ))}

      <BountyDistributionItem
        name={t("proposal:merge-modal.proposal-merger")}
        description={t("proposal:merge-modal.proposal-merger-description")}
        percentage={distributedAmounts.mergerAmount.percentage}
        symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
        line={true}
        amounts={[
          distributedAmounts.mergerAmount.value,
          handleConversion(distributedAmounts.mergerAmount.value),
        ]}
      />

      <BountyDistributionItem
        name={t("proposal:merge-modal.network-fee")}
        description={t("proposal:merge-modal.network-fee-description", {
          percentage: distributedAmounts.treasuryAmount.percentage,
        })}
        percentage={distributedAmounts.treasuryAmount.percentage}
        symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
        line={true}
        amounts={[
          distributedAmounts.treasuryAmount.value,
          handleConversion(distributedAmounts.treasuryAmount.value),
        ]}
      />

      <BountyDistributionItem
        name={t("proposal:merge-modal.proposal-creator")}
        description={t("proposal:merge-modal.proposal-creator-description")}
        percentage={distributedAmounts.proposerAmount.percentage}
        symbols={[currentTokenSymbol, state.Settings?.currency?.defaultFiat]}
        line={true}
        amounts={[
          distributedAmounts.proposerAmount.value,
          handleConversion(distributedAmounts.proposerAmount.value),
        ]}
      />
    </ul>
  );
}
