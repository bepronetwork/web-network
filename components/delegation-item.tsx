import {useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import Indicator from "components/indicator";
import Modal from "components/modal";
import TokenBalance from "components/profile/token-balance";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";
import {truncateAddress} from "helpers/truncate-address";

import {DelegationExtended} from "interfaces/oracles-state";

import {useAuthentication} from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";

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
  tokenColor
}: DelegationProps) {
  const { t } = useTranslation(["common", "profile"]);

  const [show, setShow] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const {state} = useAppState();

  const { handleTakeBack } = useBepro();

  const { updateWalletBalance } = useAuthentication();

  const isNetworkVariant = variant === "network";
  const delegationAmount = BigNumber(delegation?.amount)?.toFixed() || "0";
  const tokenBalanceType = type === "toMe" ? "oracle" : "delegation";

  const oracleToken = {
    symbol: state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name: state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder"),
    icon: <Indicator bg={tokenColor || state.Service?.network?.active?.colors?.primary} size="lg" />
  };

  const votesSymbol = t("token-votes", { token: oracleToken?.symbol })

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

    updateWalletBalance(true);
    setIsExecuting(false);
  }

  return (
    <>
      <TokenBalance
        icon={oracleToken.icon}
        symbol={votesSymbol}
        name={`${t("misc.locked")} ${tokenName || oracleToken.name}`}
        balance={delegationAmount}
        type={tokenBalanceType}
        delegation={delegation}
        onTakeBackClick={isNetworkVariant && handleShow || null}
        tokenColor={tokenColor}
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
            {formatStringToCurrency(delegationAmount)} {t("misc.votes")}
          </span>
          <span>
            {t("misc.from")} {truncateAddress(delegation?.to || "", 12, 3)}
          </span>
        </p>
      </Modal>
    </>
  );
}
