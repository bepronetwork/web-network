import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useIssue } from "contexts/issue";
import { toastError, toastSuccess } from "contexts/reducers/add-toast";

import useBepro from "x-hooks/use-bepro";

import { Amount, RowWithTwoColumns } from "./minimals";

export default function RetractOrWithdrawModal({
  show = false,
  onCloseClick,
  fundingtoRetractOrWithdraw
}) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  const [isExecuting, setIsExecuting] = useState(false);

  const { handleRetractFundBounty, handleWithdrawFundRewardBounty } = useBepro();
  const { networkIssue, getNetworkIssue } = useIssue();
  const { dispatch } = useContext(ApplicationContext);

  const tokenSymbol = networkIssue?.transactionalTokenData?.symbol;
  const rewardTokenSymbol = networkIssue?.rewardTokenData?.symbol;

  function handleRetractOrWithdraw() {
    if (!networkIssue || !fundingtoRetractOrWithdraw) return;

    setIsExecuting(true);
    if(networkIssue?.closed){
      handleWithdrawFundRewardBounty(networkIssue?.id, fundingtoRetractOrWithdraw.id)
      .then(() => {
        onCloseClick();
        getNetworkIssue();
        dispatch(toastSuccess(t("funding:modals.reward.withdraw-x-symbol", {
          amount: fundingtoRetractOrWithdraw.amount,
          symbol: tokenSymbol
        }), t("funding:modals.reward.withdraw-successfully")));
      })
      .catch(error => {
        console.debug("Failed to withdraw funds reward", error);
        dispatch(toastError(t("funding:try-again"), t("funding:modals.reward.failed-to-withdraw")));
      })
      .finally(() => setIsExecuting(false));
    } else {
      handleRetractFundBounty(networkIssue?.id, fundingtoRetractOrWithdraw.id)
      .then(() => {
        onCloseClick();
        getNetworkIssue();
        dispatch(toastSuccess(t("funding:modals.retract.retract-x-symbol", {
          amount: fundingtoRetractOrWithdraw.amount,
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
      title={networkIssue?.closed ? t("funding:modals.reward.title") : t("funding:modals.retract.title")}
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            {networkIssue?.closed ? t("funding:modals.reward.description") : t("funding:modals.retract.description")}
          </h4>

          <div className="bg-dark-gray border-radius-8 py-2 px-3 mb-2">
          <Amount
              amount={
                networkIssue?.closed
                  ? (fundingtoRetractOrWithdraw?.amount /
                      networkIssue.fundingAmount) *
                    networkIssue.rewardAmount
                  : fundingtoRetractOrWithdraw?.amount
              }
              symbol={networkIssue?.closed ?  rewardTokenSymbol : tokenSymbol}
              symbolColor={networkIssue?.closed ?  "warning" : "primary"}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            {t("funding:modals.retract.from-the")}{" "} 
            <span className="text-primary">{t("bounty:label")} #{networkIssue?.id}{" "}</span> 
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
              color={networkIssue?.closed ?  "primary" : "danger"}
              onClick={handleRetractOrWithdraw}
            >
            <span>
              {networkIssue?.closed
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