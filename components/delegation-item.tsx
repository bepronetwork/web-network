import { useState } from "react";

import { Delegation } from "@taikai/dappkit/dist/src/interfaces/delegation";
import { useTranslation } from "next-i18next";

import OracleIcon from "assets/icons/oracle-icon";

import Modal from "components/modal";

import { useAuthentication } from "contexts/authentication";

import { formatNumberToString } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import useBepro from "x-hooks/use-bepro";

import TokenBalance from "./profile/token-balance";

interface DelegationProps {
  type: "toMe" | "toOthers";
  tokenName: string;
  delegation?: Delegation;
}

export default function DelegationItem({
  type,
  tokenName,
  delegation
}: DelegationProps) {
  const { t } = useTranslation(["common", "profile"]);

  const [show, setShow] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleTakeBack } = useBepro();
  const { updateWalletBalance } = useAuthentication();

  const delegationAmount = +delegation?.amount || 0;
  const tokenBalanceType = type === "toMe" ? "oracle" : "delegation";

  const oracleToken = {
    symbol: t("$oracles"),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  function handleShow() {
    setShow(true);
  }

  function handleCancel() {
    setShow(false);
  }

  async function takeBack() {
    handleCancel();
    setIsExecuting(true);

    await handleTakeBack(delegation?.id, delegationAmount, 'Oracles').catch(console.debug);

    updateWalletBalance();
    setIsExecuting(false);
  }

  return (
    <>      
      <TokenBalance
        icon={oracleToken.icon} 
        symbol={oracleToken.symbol}
        name={`${t("misc.locked")} ${tokenName || oracleToken.name}`}
        balance={delegationAmount}
        type={tokenBalanceType}
        delegation={delegation}
        onTakeBackClick={handleShow}
      />

      <Modal
        show={show}
        title={t("actions.take-back")}
        titlePosition="center"
        onCloseClick={handleCancel}
        cancelLabel={t("actions.cancel")}
        okLabel={t("actions.confirm")}
        okDisabled={isExecuting}
        onOkClick={takeBack}
      >
        <p className="text-center h4">
          <span className="me-2">{t("actions.take-back")}</span>
          <span className="text-purple me-2">
            {formatNumberToString(delegationAmount, 2)} {t("$oracles")}
          </span>
          <span>
            {t("misc.from")} {truncateAddress(delegation?.to || "", 12, 3)}
          </span>
        </p>
      </Modal>
    </>
  );
}
