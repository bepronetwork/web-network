import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { FlexRow } from "components/common/flex-box/view";
import DelegationItem from "components/profile/pages/voting-power/delegation-item/controller";

import { Delegation } from "interfaces/curators";
import { DelegationExtended } from "interfaces/oracles-state";

import VotingPowerSubTitle from "../sub-title/controller";

interface Info {
    title: string;
    description: string;
    total: string | undefined;
    delegations: JoinedDelegation[] | (number | BigNumber)[];
}

interface DelegationsViewProps {
  type: "toMe" | "toOthers";
  variant: "network" | "multi-network";
  tokenColor: string;
  renderInfo: {
    toMe: Info;
    toOthers: Info;
  }
  votesSymbol: string;
  networkTokenName: string;
}

type JoinedDelegation = Delegation | DelegationExtended;

export default function DelegationsView({
  type = "toMe",
  variant = "network",
  tokenColor,
  renderInfo,
  votesSymbol,
  networkTokenName,
}: DelegationsViewProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  return (
    <div className="mb-3">
      <FlexRow className="mb-3 justify-content-between align-items-center">
        <VotingPowerSubTitle 
          label={renderInfo[type].title}
          infoTooltip={renderInfo[type].description}
          total={renderInfo[type].total} 
          votesSymbol={votesSymbol} 
          variant={variant} 
          tokenColor={tokenColor}        
        />
      </FlexRow>

      <div className="row">
        <div className="col">
          {type === "toOthers" &&
            !renderInfo[type].delegations?.length &&
            t("my-oracles:errors.no-delegates")}

          {(type === "toMe" || !!renderInfo[type].delegations?.length) &&
            renderInfo[type].delegations.map((delegation) => (
              <DelegationItem
                key={`delegation-${delegation.id}-${delegation.to}`}
                type={type}
                delegation={
                  type === "toMe" ? { amount: delegation } : delegation
                }
                tokenName={networkTokenName}
                variant={variant}
                tokenColor={tokenColor}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
