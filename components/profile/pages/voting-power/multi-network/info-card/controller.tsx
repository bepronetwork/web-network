import { useState } from "react";

import VotingPowerInfoCardView from "./view";

export default function VotingPowerInfoCard() {

  const [show, setShow] = useState<boolean>(true);

  function onHide() {
    setShow(false);
  }

  return (
    <VotingPowerInfoCardView
      show={show}
      onHide={onHide}
    />
  );
}
