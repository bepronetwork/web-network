import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";

import { formatStringToCurrency } from "helpers/formatNumber";

import { DistributionsProps } from "interfaces/proposal";

import { useERC20 } from "x-hooks/use-erc20";

import AmountTokenInformation from "../amount-token-information/view";

interface UpdateBountyAmountModalViewProps {
  show: boolean;
  needsApproval: boolean;
  isExecuting: boolean;
  exceedsBalance: boolean;
  transactionalERC20: useERC20;
  rewardAmount: NumberFormatValues;
  issueAmount: NumberFormatValues;
  taskAmount?: BigNumber;
  inputError: string;
  isSameValue?: boolean;
  distributions: DistributionsProps;
  onIssueAmountValueChange: (
    values: NumberFormatValues,
    type: "reward" | "total"
  ) => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
  handleApprove: () => void;
}

export default function UpdateBountyAmountModalView({
  show,
  needsApproval,
  isExecuting,
  exceedsBalance,
  transactionalERC20,
  rewardAmount,
  issueAmount,
  inputError,
  distributions,
  taskAmount,
  isSameValue,
  onIssueAmountValueChange,
  handleSubmit,
  handleClose,
  handleApprove,
}: UpdateBountyAmountModalViewProps) {
  const { t } = useTranslation(["common", "bounty"]);

  return (
    <Modal
      show={show}
      onCloseClick={handleClose}
      title={t("modals.update-bounty-amount.title")}
      titlePosition="center"
      footer={
        <div className="d-flex pt-2 justify-content-between">
          <Button color="dark-gray" onClick={handleClose}>
            {t("actions.cancel")}
          </Button>
          {needsApproval ? (
            <ContractButton
              onClick={handleApprove}
              disabled={isExecuting || exceedsBalance}
              withLockIcon={exceedsBalance}
              isLoading={isExecuting}
            >
              <span>{t("actions.approve")}</span>
            </ContractButton>
          ) : (
            <ContractButton
              disabled={isExecuting || exceedsBalance || !issueAmount || !!inputError || !!isSameValue}
              withLockIcon={exceedsBalance || !issueAmount || !!inputError || !!isSameValue}
              onClick={handleSubmit}
              isLoading={isExecuting}
            >
              <span>{t("actions.confirm")}</span>
            </ContractButton>
          )}
        </div>
      }
    >
      <div className="container">
        <AmountTokenInformation
          isFunding={false}
          currentToken={{
            name: transactionalERC20.name,
            symbol: transactionalERC20.symbol,
            address: transactionalERC20.address,
          }}
          rewardAmount={rewardAmount}
          issueAmount={issueAmount}
          tokenBalance={transactionalERC20.balance}
          decimals={transactionalERC20.decimals}
          inputError={inputError}
          distributions={distributions}
          onIssueAmountValueChange={onIssueAmountValueChange}
          classNameInputs="col-md-6 col-12 mt-1"
        />

        <div className="d-flex justify-content-end">
          <span className="text-gray me-1">{t("bounty:your-balance")}: </span>
          {formatStringToCurrency(transactionalERC20.balance.toFixed(2))}{" "}
          {transactionalERC20.symbol}
        </div>

        <div className="d-flex justify-content-end">
          <span className="text-gray me-1">{t("bounty:locked-in-the-task")}:</span>
          {formatStringToCurrency(taskAmount.toFixed(2))}{" "}
          {transactionalERC20.symbol}
        </div>

        <div className="d-flex justify-content-end">
          <span className="text-gray me-1">{t("bounty:available")}:</span>
          {formatStringToCurrency(transactionalERC20.balance.gt(0) ? 
            taskAmount.plus(transactionalERC20.balance).toFixed(2) : "0.00")}{" "}
          {transactionalERC20.symbol}
        </div>
      </div>
    </Modal>
  );
}
