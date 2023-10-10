import { useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { DelegationExtended } from "interfaces/oracles-state";

import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import useOracleToken from "x-hooks/use-oracle-token";

import DelegationItemView from "./view";

interface DelegationProps {
  type: "toMe" | "toOthers";
  tokenName: string;
  tokenColor?: string;
  delegation?: DelegationExtended;
  variant?: "network" | "multi-network";
}

export default function DelegationItem({
  type,
  tokenName,
  delegation,
  variant = "network",
  tokenColor,
}: DelegationProps) {
  const { t } = useTranslation(["common", "profile"]);

  const [show, setShow] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleTakeBack } = useBepro();
  const { currentOracleToken } = useOracleToken();

  const { updateWalletBalance } = useAuthentication();

  const delegationAmount = BigNumber(delegation?.amount)?.toFixed() || "0";
  const tokenBalanceType = type === "toMe" ? "oracle" : "delegation";

  const votesSymbol = t("token-votes", { token: currentOracleToken?.symbol });

  function handleShow() {
    setShow(true);
  }

  function handleCancel() {
    setShow(false);
  }

  async function takeBack() {
    handleCancel();
    setIsExecuting(true);

    await handleTakeBack(delegation?.id, delegationAmount, "Oracles").catch(console.debug);

    updateWalletBalance(true);
    setIsExecuting(false);
  }

  return (
    <DelegationItemView
      tokenName={tokenName}
      tokenColor={tokenColor}
      delegation={delegation}
      variant={variant}
      oracleToken={currentOracleToken}
      delegationAmount={delegationAmount}
      tokenBalanceType={tokenBalanceType}
      votesSymbol={votesSymbol}
      handleShow={handleShow}
      show={show}
      handleCancel={handleCancel}
      isExecuting={isExecuting}
      takeBack={takeBack}
    />
  );
}
