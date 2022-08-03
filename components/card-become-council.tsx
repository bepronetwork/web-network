import React, { useState } from "react";

import { useTranslation } from "next-i18next";
import Link from "next/link";

import ArrowRight from "assets/icons/arrow-right";
import CloseIcon from "assets/icons/close-icon";

import { formatNumberToNScale } from "helpers/formatNumber";

import useNetwork from "x-hooks/use-network";

import Button from "./button";

export default function CardBecomeCouncil() {
  const { t } = useTranslation("council");
  const [show, setShow] = useState<boolean>(true);
  const { network: activeNetwork, getURLWithNetwork } = useNetwork();

  if (!show) return null;

  return (
    <div className="become-council p-2 ps-4 pb-3">
      <div className="d-flex d-flex justify-content-end">
        <Button
          transparent
          className="card-close-button p-1"
          onClick={() => setShow(false)}
        >
          <CloseIcon className="text-purple" />
        </Button>
      </div>
      <h4 className="h4 pb-2">{t("become-council")}</h4>
      <div className="text-gray pe-3 pb-2">
        {t("become-council-description-part-one")}{" "}
        <span className="amount-white-color">
          {formatNumberToNScale(activeNetwork?.councilAmount)}
        </span>{" "}
        <span className="text-primary">
          {activeNetwork?.networkToken?.symbol}
        </span>{" "}
        {t("become-council-description-part-two")}
      </div>
      <Link href={getURLWithNetwork("/profile/wallet")}>
        <a className="text-decoration-none text-purple text-uppercase">
          {t("go-to-wallet")} <ArrowRight className="text-purple ms-2 mb-1" />
        </a>
      </Link>
    </div>
  );
}
