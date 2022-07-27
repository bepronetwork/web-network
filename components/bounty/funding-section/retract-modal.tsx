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

export default function RetractModal({
  show = false,
  onCloseClick,
  fundingToRetract
}) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  const [isExecuting, setIsExecuting] = useState(false);

  const { handleRetractFundBounty } = useBepro();
  const { networkIssue, getNetworkIssue } = useIssue();
  const { dispatch } = useContext(ApplicationContext);

  const tokenSymbol = networkIssue?.transactionalTokenData?.symbol;

  function handleRetract() {
    if (!networkIssue || !fundingToRetract) return;

    setIsExecuting(true);
    
    handleRetractFundBounty(networkIssue.id, fundingToRetract.id)
      .then(() => {
        onCloseClick();
        getNetworkIssue();
        dispatch(toastSuccess(t("funding:modals.retract.retract-x-symbol", {
          amount: fundingToRetract.amount,
          symbol: tokenSymbol
        }), t("funding:modals.retract.retract-successfully")));
      })
      .catch(error => {
        console.debug("Failed to retract funds", error);
        dispatch(toastError(t("funding:try-again"), t("funding:failed-to-retract")));
      })
      .finally(() => setIsExecuting(false));
  }
  
  return(
    <Modal
      title={t("funding:modals.retract.title")}
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            {t("funding:modals.retract.description")}
          </h4>

          <div className="bg-dark-gray border-radius-8 py-2 px-3 mb-2">
            <Amount
              amount={fundingToRetract?.amount}
              symbol={tokenSymbol}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            {t("funding:modals.retract.from-the")} 
            <span className="text-primary">{t("bounty:label")} #{networkIssue?.id}</span> 
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
              color="danger"
              onClick={handleRetract}
            >
              <span>{t("funding:actions.retract-funding")}</span>
              { isExecuting && <span className="spinner-border spinner-border-xs ml-1" /> }
            </Button>
          }
        />
    </Modal>
  );
}