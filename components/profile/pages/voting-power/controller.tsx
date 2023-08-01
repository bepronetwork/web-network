import { useRouter } from "next/router";

import VotingPowerMultiNetwork from "components/profile/pages/voting-power/multi-network/controller";
import VotingPowerNetwork from "components/profile/pages/voting-power/network/controller";

import VotingPowerPageView from "./view";

export default function VotingPowerPage() {
  const { query } = useRouter();

  const { network } = query;

  const isOnNetwork = !!network;

  function renderChildrenVotingPower() {
    if (isOnNetwork) return <VotingPowerNetwork />;

    return <VotingPowerMultiNetwork />;
  }

  return (
    <VotingPowerPageView>
      {renderChildrenVotingPower()}
    </VotingPowerPageView>
  );
}
