import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";

import LockedIcon from "assets/icons/locked-icon";

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
        dispatch(toastSuccess(`Retracted ${fundingToRetract.amount} $${tokenSymbol}`, "Retract Funds successfully"));
      })
      .catch(error => {
        console.debug("Failed to retract funds", error);
        dispatch(toastError("Something went wrong. Try again later.", "Failed to retract funds"));
      })
      .finally(() => setIsExecuting(false));
  }
  
  return(
    <Modal
      title="Retract Funding"
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            You are about to retract
          </h4>

          <div className="bg-dark-gray border-radius-8 py-2 px-3 mb-2">
            <Amount
              amount={fundingToRetract?.amount}
              symbol={tokenSymbol}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            from the <span className="text-primary">Bounty #{networkIssue?.id}</span> fund.
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
              Cancel
            </Button>
          }
          col2={
            <Button
              disabled={isExecuting}
              color="danger"
              onClick={handleRetract}
            >
              <span>Retract Funding</span>
              { isExecuting && <span className="spinner-border spinner-border-xs ml-1" /> }
            </Button>
          }
        />
    </Modal>
  );
}