import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ProposalDistributionListView from "components/proposal/distribution/list/view";

import { useAppState } from "contexts/app-state";

import { DistributedAmounts } from "interfaces/proposal";
import { TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

interface ProposalDistributionListProps {
  distributedAmounts: DistributedAmounts;
  transactionalTokenSymbol: string;
}

export default function ProposalDistributionList({
  distributedAmounts,
  transactionalTokenSymbol,
}: ProposalDistributionListProps) {
  const { t } = useTranslation(["common", "proposal"]);

  const [coinInfo, setCoinInfo] = useState<TokenInfo>();

  const { state } = useAppState();

  const defaultFiat = state.Settings?.currency?.defaultFiat;

  async function getCoinInfo() {
    await getCoinInfoByContract(state.Service?.network?.active?.networkToken?.symbol)
      .then((tokenInfo) => {
        setCoinInfo(tokenInfo);
      })
      .catch((error) => console.debug("getCoinInfo", error));
  }

  const handleConversion = (value) =>
    BigNumber(value)
      .multipliedBy(coinInfo?.prices[defaultFiat] || 0)
      .toFixed(4);

  useEffect(() => {
    if (state.Service?.network?.amounts) getCoinInfo();
  }, [state.Service?.network?.amounts]);

  return (
    <ProposalDistributionListView
      distributedAmounts={distributedAmounts}
      transactionalTokenSymbol={transactionalTokenSymbol || t("common:misc.token")}
      fiatSymbol={defaultFiat}
      convertValue={handleConversion}
    />
  );
}
