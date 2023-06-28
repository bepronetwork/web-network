import { useState } from "react";

import { useTranslation } from "next-i18next";

import BecomeCuratorCardView from "components/cards/become-curator/view";

import {useAppState} from "contexts/app-state";

import {formatNumberToNScale} from "helpers/formatNumber";

import { useNetwork } from "x-hooks/use-network";

interface BecomeCuratorCardProps {
  isCouncil?: boolean;
}

export default function BecomeCuratorCard({
  isCouncil = false
}: BecomeCuratorCardProps) {
  const { t } = useTranslation(["council", "common"]);

  const [show, setShow] = useState<boolean>(!isCouncil);
  
  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();

  const councilAmount = formatNumberToNScale(+state.Service?.network?.amounts?.councilAmount);
  const networkTokenSymbol = state.Service?.network?.active?.networkToken?.symbol || t("common:misc.token");
  const votingPowerHref = getURLWithNetwork("/profile/voting-power");

  function onHide() {
    setShow(false);
  }

  return (
    <BecomeCuratorCardView
      show={show}
      onHide={onHide}
      councilAmount={councilAmount}
      networkTokenSymbol={networkTokenSymbol}
      votingPowerHref={votingPowerHref}
    />
  );
}
