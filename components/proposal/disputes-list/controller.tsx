import BigNumber from "bignumber.js";

import { ProposalDisputesView } from "components/proposal/disputes-list/view";

import { useAppState } from "contexts/app-state";

import { ProposalDisputes } from "interfaces/proposal";

interface ProposalDisputesProps {
  disputes: ProposalDisputes[];
  networkTokenSymbol: string;
}

export function ProposalDisputes({ 
  disputes,
  networkTokenSymbol,
}: ProposalDisputesProps) {
  const { state } = useAppState();

  function percentage(value: string) {
    const totalNetworkToken = state.Service?.network?.amounts?.totalNetworkToken;

    if (!totalNetworkToken) return "0";

    return BigNumber(value)
      .dividedBy(totalNetworkToken)
      .multipliedBy(100)
      .toFixed(2);
  }

  return (
    <ProposalDisputesView
      disputes={disputes}
      networkTokenSymbol={networkTokenSymbol}
      defaultFiat={state.Settings?.currency?.defaultFiat}
      calculatePercentage={percentage}
    />
  );
}
