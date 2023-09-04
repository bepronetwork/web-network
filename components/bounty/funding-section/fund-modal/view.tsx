import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import FundingProgress from "components/bounty/funding-section/funding-progress/controller";
import {Amount, CaptionMedium, RowWithTwoColumns} from "components/bounty/funding-section/minimals.view";
import Button from "components/button";
import ContractButton from "components/contract-button";
import InputWithBalance from "components/input-with-balance";
import Modal from "components/modal";

import { IssueBigNumberData } from "interfaces/issue-data";
import { Token } from "interfaces/token";

interface FundModalViewProps {
    show: boolean;
    handleClose: () => void;
    bounty: IssueBigNumberData;
    transactionalToken: Token;
    rewardToken: Token;
    handleSetAmountToFund: (value: BigNumber) => void;
    amountNotFunded: BigNumber;
    balance: BigNumber;
    fundBtnDisabled: boolean;
    confirmBtn: {
        label: string;
        action: () => void;
    };
    isExecuting: boolean;
    rewardPreview: string;
    amountToFund: BigNumber;
}

export default function FundModalView({
  show,
  handleClose,
  bounty,
  transactionalToken,
  rewardToken,
  handleSetAmountToFund,
  amountNotFunded,
  balance,
  fundBtnDisabled,
  confirmBtn,
  isExecuting,
  rewardPreview,
  amountToFund,
}: FundModalViewProps) {
  const {t} = useTranslation(["common", "funding", "bounty"]);
  
  const SubTitle = 
    <span className="caption-medium text-gray font-weight-normal">
      {t("funding:modals.fund.description")}
      <span className="text-primary text-capitalize"> {t("bounty:label")} #{bounty?.contractId || "XX"}</span>
    </span>;

  return(
    <Modal 
      title={t("funding:modals.fund.title")}
      subTitleComponent={SubTitle}
      show={show}
      onCloseClick={handleClose}
      onCloseDisabled={isExecuting}
    >
      <div className="mt-2 px-2 d-grid gap-4">
        <FundingProgress
          fundedAmount={bounty?.fundedAmount?.toFixed()}
          fundingAmount={bounty?.fundingAmount?.toFixed()}
          fundingTokenSymbol={transactionalToken?.symbol}
          fundedPercent={bounty?.fundedPercent?.toString()}
          amountToFund={amountToFund?.toFixed()}
        />

        <InputWithBalance
          label={t("funding:modals.fund.fields.fund-amount.label")}
          value={amountToFund}
          onChange={handleSetAmountToFund}
          symbol={transactionalToken?.symbol}
          balance={balance}
          decimals={transactionalToken?.decimals || 18}
          max={BigNumber.minimum(amountNotFunded, balance)}
          disabled={isExecuting}
        />

        {BigNumber(bounty?.rewardAmount || 0).gt(0) && (
          <RowWithTwoColumns
            col1={<CaptionMedium text={t("funding:reward")} color="white" />}
            col2={
              <div className="d-flex align-items-center gap-1 bg-dark-gray border-radius-8 py-2 px-3">
                +
                <Amount
                  amount={rewardPreview}
                  symbol={rewardToken?.symbol}
                  symbolColor="warning"
                  className="caption-large text-white font-weight-normal"
                />
              </div>
            }
          />
        )}

        <RowWithTwoColumns
          col1={
            <Button 
              color="gray" 
              outline
              onClick={handleClose}
              disabled={isExecuting}
            >
              {t("actions.cancel")}
            </Button>
          }
          col2={
            <ContractButton
              disabled={fundBtnDisabled}
              onClick={confirmBtn.action}
              withLockIcon={fundBtnDisabled && !isExecuting}
              isLoading={isExecuting}
            >
              <span>{confirmBtn.label}</span>
            </ContractButton>
          }
        />
      </div>
    </Modal>
  );
}