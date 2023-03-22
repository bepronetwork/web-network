import {useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import {Amount, RowWithTwoColumns} from "components/bounty/funding-section/minimals";
import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {fundingBenefactor} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useBounty} from "x-hooks/use-bounty";

interface RetractOrWithdrawModalProps {
  show?: boolean;
  onCloseClick: () => void;
  funding: fundingBenefactor;
}

export default function RetractOrWithdrawModal({
  show = false,
  onCloseClick,
  funding
} : RetractOrWithdrawModalProps) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  const [isExecuting, setIsExecuting] = useState(false);

  const { processEvent } = useApi();
  const { getDatabaseBounty } = useBounty();
  const { handleRetractFundBounty, handleWithdrawFundRewardBounty } = useBepro();

  const { dispatch, state } = useAppState();

  const isBountyClosed = !!state.currentBounty?.data?.isClosed;
  const tokenSymbol = state.currentBounty?.data?.transactionalToken?.symbol;
  const rewardTokenSymbol = state.currentBounty?.data?.rewardToken?.symbol;
  const retractOrWithdrawAmount = isBountyClosed ?
    funding?.amount?.dividedBy(state.currentBounty?.data?.fundingAmount)
      .multipliedBy(state.currentBounty?.data?.rewardAmount)?.toFixed() :
    funding?.amount?.toFixed();

  function handleRetractOrWithdraw() {
    if (!state.currentBounty?.data || !funding) return;

    setIsExecuting(true);
    if(isBountyClosed){
      handleWithdrawFundRewardBounty(state.currentBounty?.data?.contractId,
                                     funding.contractId,
                                     retractOrWithdrawAmount,
                                     rewardTokenSymbol)
      .then(() => {
        return processEvent("bounty", "withdraw", state.Service?.network?.lastVisited, {
          issueId: state.currentBounty?.data?.issueId
        });
      })
      .then(() => {
        getDatabaseBounty(true);
        onCloseClick();
        dispatch(toastSuccess(t("funding:modals.reward.withdraw-x-symbol", {
          amount: retractOrWithdrawAmount,
          symbol: rewardTokenSymbol
        }), t("funding:modals.reward.withdraw-successfully")));
      })
      .catch(error => {
        console.debug("Failed to withdraw funds reward", error);
        dispatch(toastError(t("funding:try-again"), t("funding:modals.reward.failed-to-withdraw")));
      })
      .finally(() => setIsExecuting(false));
    } else {
      handleRetractFundBounty(state.currentBounty?.data?.contractId, funding.contractId)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        getDatabaseBounty(true);
        
        return processEvent("bounty", "funded", state.Service?.network?.lastVisited, {
          fromBlock
        });
      })
      .then(() => {
        onCloseClick();
        dispatch(toastSuccess(t("funding:modals.retract.retract-x-symbol", {
          amount: retractOrWithdrawAmount,
          symbol: tokenSymbol
        }), t("funding:modals.retract.retract-successfully")));
      })
      .catch(error => {
        console.debug("Failed to retract funds", error);
        dispatch(toastError(t("funding:try-again"), t("funding:modals.retract.failed-to-retract")));
      })
      .finally(() => setIsExecuting(false));
    }
  }
  
  return(
    <Modal
      title={isBountyClosed ? 
        t("funding:modals.reward.title") : t("funding:modals.retract.title")}
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            {isBountyClosed ? 
              t("funding:modals.reward.description") : t("funding:modals.retract.description")}
          </h4>

          <div className="bg-dark-gray border-radius-8 py-2 px-3 mb-2">
          <Amount
              amount={retractOrWithdrawAmount}
              symbol={isBountyClosed ?  rewardTokenSymbol : tokenSymbol}
              symbolColor={isBountyClosed ?  "warning" : "primary"}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            {t("funding:modals.retract.from-the")}{" "} 
            <span className="text-primary">{t("bounty:label")} #{state.currentBounty?.data?.contractId}{" "}</span>
            {t("funding:fund")}.
          </h4>
        </Col>
      </Row>

      <RowWithTwoColumns
          col1={
            <Button
              color="gray" 
              outline
              onClick={onCloseClick}
            >
              {t("actions.cancel")}
            </Button>
          }
          col2={
            <ContractButton
              disabled={isExecuting}
              color={isBountyClosed ?  "primary" : "danger"}
              onClick={handleRetractOrWithdraw}
            >
            <span>
              {isBountyClosed
                ? t("funding:actions.withdraw-funding")
                : t("funding:actions.retract-funding")}
            </span>
              { isExecuting && <span className="spinner-border spinner-border-xs ml-1" /> }
            </ContractButton>
          }
        />
    </Modal>
  );
}