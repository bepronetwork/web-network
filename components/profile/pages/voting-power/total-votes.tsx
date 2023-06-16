import { ReactNode } from "react";

import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import { useTranslation } from "next-i18next";

import TokenSymbolView from "components/common/token-symbol/view";
import InfoTooltip from "components/info-tooltip";
import NetworkItem from "components/profile/network-item";
import { FlexRow } from "components/profile/wallet-balance";

import { formatStringToCurrency } from "helpers/formatNumber";

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

  function getTextColorProps() {
    if (tokenColor)
      return {
        style: {
          color: tokenColor
        }
      };

    return {
      className: "text-primary"
    };
  }

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
      <FlexRow className="mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-500">
          {t("profile:total-votes")}
        </span>

        <FlexRow className={clsx([
          "d-flex justify-content-center align-items-center gap-2 caption-large",
          "text-white py-2 px-3 border-radius-4 border border-gray-800 font-weight-medium",
          variant === "network" ? "bg-gray-900" : "bg-gray-950"
        ])}>
          <span>
            {formatStringToCurrency(votesLocked.plus(votesDelegatedToMe).toFixed())}
          </span>

          <TokenSymbolView name={votesSymbol} {...getTextColorProps()} />

          <InfoTooltip
            description={t("profile:tips.total-oracles", {
              tokenName: tokenName
            })}
            secondaryIcon
          />
        </FlexRow>
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