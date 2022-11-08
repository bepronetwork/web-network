import {useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {fundingBenefactor} from "interfaces/issue-data";


import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useBounty} from "x-hooks/use-bounty";

import {Amount, RowWithTwoColumns} from "./minimals";


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
  const { handleRetractFundBounty, handleWithdrawFundRewardBounty } = useBepro();
  const { getDatabaseBounty, getChainBounty } = useBounty();

  const { dispatch, state } = useAppState();

  const tokenSymbol = state.currentBounty?.chainData?.transactionalTokenData?.symbol;
  const rewardTokenSymbol = state.currentBounty?.chainData?.rewardTokenData?.symbol;
  const retractOrWithdrawAmount = state.currentBounty?.chainData?.closed ?
    funding?.amount?.dividedBy(state.currentBounty?.chainData?.fundingAmount).multipliedBy(state.currentBounty?.chainData?.rewardAmount)?.toFixed() :
    funding?.amount?.toFixed();

  function handleRetractOrWithdraw() {
    if (!state.currentBounty?.chainData || !funding) return;

    setIsExecuting(true);
    if(state.currentBounty?.chainData?.closed){
      handleWithdrawFundRewardBounty(state.currentBounty?.chainData?.id, funding.contractId, retractOrWithdrawAmount, rewardTokenSymbol)
      .then(() => {
        onCloseClick();
        getChainBounty(true);
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
      handleRetractFundBounty(state.currentBounty?.chainData?.id, funding.contractId)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        
        return processEvent("bounty", "funded", state.Service?.network?.active?.name, {
          fromBlock
        });
      })
      .then(() => {
        onCloseClick();
        getChainBounty(true);
        getDatabaseBounty(true);
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
      title={state.currentBounty?.chainData?.closed ? t("funding:modals.reward.title") : t("funding:modals.retract.title")}
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            {state.currentBounty?.chainData?.closed ? t("funding:modals.reward.description") : t("funding:modals.retract.description")}
          </h4>

          <div className="bg-dark-gray border-radius-8 py-2 px-3 mb-2">
          <Amount
              amount={retractOrWithdrawAmount}
              symbol={state.currentBounty?.chainData?.closed ?  rewardTokenSymbol : tokenSymbol}
              symbolColor={state.currentBounty?.chainData?.closed ?  "warning" : "primary"}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            {t("funding:modals.retract.from-the")}{" "} 
            <span className="text-primary">{t("bounty:label")} #{state.currentBounty?.chainData?.id}{" "}</span>
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
            <Button
              disabled={isExecuting}
              color={state.currentBounty?.chainData?.closed ?  "primary" : "danger"}
              onClick={handleRetractOrWithdraw}
            >
            <span>
              {state.currentBounty?.chainData?.closed
                ? t("funding:actions.withdraw-funding")
                : t("funding:actions.retract-funding")}
            </span>
              { isExecuting && <span className="spinner-border spinner-border-xs ml-1" /> }
            </Button>
          }
        />
    </Modal>
  );
}