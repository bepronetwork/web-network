import { NumberFormatValues } from "react-number-format";

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
  inputError: string;
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
            <Button
              onClick={handleApprove}
              disabled={isExecuting || exceedsBalance}
              withLockIcon={exceedsBalance}
              isLoading={isExecuting}
            >
              <span>{t("actions.approve")}</span>
            </Button>
          ) : (
            <ContractButton
              disabled={isExecuting || exceedsBalance || !issueAmount || !!inputError}
              withLockIcon={exceedsBalance || !issueAmount || !!inputError}
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
          <span className="text-gray me-1">{t('bounty:balance')}</span>
          {formatStringToCurrency(transactionalERC20.balance.toFixed())}{" "}
          {transactionalERC20.symbol}
        </div>
      </div>
    </Modal>
  );
}
