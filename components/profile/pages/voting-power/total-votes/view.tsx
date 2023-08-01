import { ReactNode } from "react";

import { BigNumber } from "bignumber.js";
import { useTranslation } from "next-i18next";

import { FlexRow } from "components/common/flex-box/view";
import NetworkItem from "components/profile/network-item/controller";

import VotingPowerSubTitle from "../sub-title/controller";
interface TotalVotesProps {
  votesLocked: BigNumber;
  votesDelegatedToMe: BigNumber;
  icon: string | ReactNode;
  tokenName: string;
  tokenColor?: string;
  tokenSymbol: string;
  votesSymbol: string;
  variant?: "network" | "multi-network";
}

export default function TotalVotes({
  votesLocked,
  votesDelegatedToMe,
  icon,
  tokenName,
  tokenSymbol,
  votesSymbol,
  variant = "network",
  tokenColor
} : TotalVotesProps) {
  const { t } = useTranslation(["common", "profile"]);

  function getAmountItem(amount) {
    return <NetworkItem
      type="voting"
      iconNetwork={icon}
      amount={amount}
      symbol={votesSymbol}
      networkName={tokenSymbol}
      primaryColor={tokenColor}
      subNetworkText={votesSymbol}
      variant={variant}
    />;
  }

  return(
    <div className="border border-gray-800 p-4 border-radius-4 col-12">
      <FlexRow className="mb-3 justify-content-between align-items-center flex-wrap">
        <VotingPowerSubTitle 
          label={t("profile:total-votes")}
          infoTooltip={t("profile:tips.total-oracles", {
            tokenName: tokenName,
          })}
          total={votesLocked.plus(votesDelegatedToMe).toFixed()} 
          votesSymbol={votesSymbol} 
          variant={variant} 
          tokenColor={tokenColor}        
        />
      </FlexRow>

      <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3">
        <span>{t("profile:locked-by-me")}</span>
      </div>

      {getAmountItem(votesLocked.toFixed())}

      <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3 mt-4">
        <span>{t("profile:deletaged-to-me")}</span>
      </div>

      {getAmountItem(votesDelegatedToMe.toFixed())}
    </div>
  );
}