import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import Indicator from "components/indicator";

import { Delegation } from "interfaces/curators";
import { Network } from "interfaces/network";

import Delegations from "../../delegations/controller";
import TotalVotes from "../../total-votes/view";

interface VotingPowerDataProps {
  tokensLocked: string;
  delegatedToMe: string;
  delegations: Delegation[];
  network: Network;
  key?: number;
}

export default function VotingPowerRowView({
  tokensLocked,
  delegatedToMe,
  delegations,
  network,
  key,
}: VotingPowerDataProps) {
  const { t } = useTranslation(["common"]);

  const votesDelegatedToOthers = delegations?.reduce((acc, curr) => acc.plus(curr?.amount), BigNumber("0"));
  
  return (
    <div className="col-12" key={key}>
      <TotalVotes
        votesLocked={BigNumber(tokensLocked)}
        votesDelegatedToMe={BigNumber(delegatedToMe)}
        votesDelegatedToOthers={votesDelegatedToOthers}
        icon={<Indicator bg={network?.colors?.primary} size="lg" />}
        tokenColor={network?.colors?.primary}
        tokenName={network?.networkToken?.name}
        tokenSymbol={network?.networkToken?.symbol}
        votesSymbol={`${network?.networkToken?.symbol} ${t("misc.votes")}`}
        variant="multi-network"
      />

      <div className="mt-3">
        <Delegations
          type="toOthers"
          delegations={delegations}
          variant="multi-network"
          tokenColor={network?.colors?.primary}
        />
      </div>
    </div>
  );
}
