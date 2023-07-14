import { useTranslation } from "next-i18next";

import Modal from "components/modal";
import TokenBalance from "components/profile/token-balance";

import { formatStringToCurrency } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { DelegationExtended, OracleToken } from "interfaces/oracles-state";

interface DelegationItemViewProps {
  tokenName: string;
  tokenColor: string;
  delegation: DelegationExtended;
  variant: "network" | "multi-network";
  oracleToken: OracleToken;
  delegationAmount: string;
  tokenBalanceType: "oracle" | "delegation";
  votesSymbol: string;
  handleShow: () => void;
  show: boolean;
  handleCancel: () => void;
  isExecuting: boolean;
  takeBack: () => void;
}

export default function DelegationItemView({
  tokenName,
  delegation,
  variant = "network",
  tokenColor,
  oracleToken,
  delegationAmount,
  tokenBalanceType,
  votesSymbol,
  handleShow,
  show,
  handleCancel,
  isExecuting,
  takeBack,
}: DelegationItemViewProps) {
  const { t } = useTranslation(["common", "profile"]);

  return (
    <>
      <TokenBalance
        icon={oracleToken.icon}
        symbol={votesSymbol}
        name={`${t("misc.locked")} ${tokenName || oracleToken.name}`}
        balance={delegationAmount}
        type={tokenBalanceType}
        delegation={delegation}
        onTakeBackClick={handleShow}
        tokenColor={tokenColor}
        variant={variant}
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
