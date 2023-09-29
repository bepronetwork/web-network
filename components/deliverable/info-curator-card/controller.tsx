import { useNetwork } from "x-hooks/use-network";

import DeliverableInfoCardView from "./view";

export default function DeliverableInfoCuratorCard() {
  
  const { getURLWithNetwork } = useNetwork();

  const votingPowerHref = getURLWithNetwork("/profile/voting-power");

  return (
    <DeliverableInfoCardView
      votingPowerHref={votingPowerHref}
    />
  );
}