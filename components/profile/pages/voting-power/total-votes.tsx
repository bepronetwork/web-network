import { ReactNode } from "react";

import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import { useTranslation } from "next-i18next";

import InfoTooltip from "components/info-tooltip";
import NetworkItem from "components/profile/network-item";
import { FlexRow } from "components/profile/wallet-balance";

import { formatStringToCurrency } from "helpers/formatNumber";

interface TotalVotesProps {
  votesLocked: BigNumber;
  votesDelegatedToMe: BigNumber;
  icon: string | ReactNode;
  tokenName: string;
  tokenSymbol: string;
  votesSymbol: string;
}

export default function TotalVotes({
  votesLocked,
  votesDelegatedToMe,
  icon,
  tokenName,
  tokenSymbol,
  votesSymbol
} : TotalVotesProps) {
  const { t } = useTranslation(["common", "profile"]);

  return(
    <div className="border border-gray-800 p-4 border-radius-4">
      <FlexRow className="mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-500">
          Total Votes
        </span>

        <FlexRow className={clsx([
          "d-flex justify-content-center align-items-center gap-2 caption-large",
          "text-white bg-gray-900 py-2 px-3 border-radius-4 border border-gray-800 font-weight-medium"
        ])}>
          <span>
            {formatStringToCurrency(votesLocked.plus(votesDelegatedToMe).toFixed())}
          </span>

          <span className="text-primary">
            {votesSymbol}
          </span>

          <InfoTooltip
            description={t("profile:tips.total-oracles", {
              tokenName: tokenName
            })}
            secondaryIcon
          />
        </FlexRow>
      </FlexRow>

      <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3">
        <span>Locked by me</span>
      </div>

      <NetworkItem
        type="voting"
        iconNetwork={icon}
        amount={votesLocked.toFixed()}
        symbol={votesSymbol}
        networkName={tokenSymbol}
        subNetworkText={votesSymbol}
      />

      <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3 mt-4">
        <span>Delegated to me</span>
      </div>


      <NetworkItem
        type="voting"
        iconNetwork={icon}
        amount={votesDelegatedToMe.toFixed()}
        symbol={votesSymbol}
        networkName={tokenSymbol}
        subNetworkText={votesSymbol}
      />
    </div>
  );
}