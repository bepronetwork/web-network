import { ReactNode } from "react";

import { BigNumber } from "bignumber.js";
import { useTranslation } from "next-i18next";

import { FlexRow } from "components/common/flex-box/view";
import VotingPowerSubTitle from "components/profile/pages/voting-power/sub-title/controller";
import VotesAmount from "components/profile/pages/voting-power/total-votes/votes-amount/view";

interface TotalVotesProps {
  votesLocked: BigNumber;
  votesDelegatedToMe: BigNumber;
  votesDelegatedToOthers: BigNumber;
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
  votesDelegatedToOthers,
  icon,
  tokenName,
  tokenSymbol,
  votesSymbol,
  variant = "network",
  tokenColor
} : TotalVotesProps) {
  const { t } = useTranslation(["common", "profile"]);

  return(
    <div className="border border-gray-800 p-4 border-radius-4 col-12">
      <FlexRow className="mb-3 justify-content-between align-items-center flex-wrap">
        <VotingPowerSubTitle 
          label={t("profile:total-votes")}
          infoTooltip={t("profile:tips.total-oracles", {
            tokenName: tokenName,
          })}
          total={votesLocked.plus(votesDelegatedToMe)?.toFixed()} 
          votesSymbol={votesSymbol} 
          variant={variant} 
          tokenColor={tokenColor}        
        />
      </FlexRow>

      <VotesAmount
        label={t("profile:locked-by-me")}
        amount={votesLocked?.toFixed()}
        networkIcon={icon}
        votesSymbol={votesSymbol}
        tokenSymbol={tokenSymbol}
        tokenColor={tokenColor}
        variant={variant}
        className="mb-4"
      />

      <VotesAmount
        label={t("profile:deletaged-to-me")}
        amount={votesDelegatedToMe?.toFixed()}
        networkIcon={icon}
        votesSymbol={votesSymbol}
        tokenSymbol={tokenSymbol}
        tokenColor={tokenColor}
        variant={variant}
        className="mb-4"
      />

      <VotesAmount
        label={t("profile:deletaged-to-others")}
        amount={votesDelegatedToOthers?.toFixed()}
        networkIcon={icon}
        votesSymbol={votesSymbol}
        tokenSymbol={tokenSymbol}
        tokenColor={tokenColor}
        variant={variant}
      />
    </div>
  );
}