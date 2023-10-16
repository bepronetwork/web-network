import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import {
  Amount,
  RowWithTwoColumns,
} from "components/bounty/funding-section/minimals.view";
import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";


interface RetractOrWithdrawModalViewProps {
  show: boolean;
  onCloseClick: () => void;
  isExecuting: boolean;
  isBountyClosed: boolean;
  retractOrWithdrawAmount: string;
  rewardTokenSymbol: string;
  tokenSymbol: string;
  handleRetractOrWithdraw: () => void;
  contractId: number;
}

export default function RetractOrWithdrawModalView({
  show,
  onCloseClick,
  isExecuting,
  isBountyClosed,
  retractOrWithdrawAmount,
  rewardTokenSymbol,
  tokenSymbol,
  handleRetractOrWithdraw,
  contractId
}: RetractOrWithdrawModalViewProps) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  return (
    <Modal
      title={
        isBountyClosed
          ? t("funding:modals.reward.title")
          : t("funding:modals.retract.title")
      }
      show={show}
      onCloseClick={onCloseClick}
    >
      <Row className="justify-content-center text-center">
        <Col xs="auto">
          <h4 className="family-Regular font-weight-normal mb-2">
            {isBountyClosed
              ? t("funding:modals.reward.description")
              : t("funding:modals.retract.description")}
          </h4>

          <div className="d-flex bg-dark-gray border-radius-8 py-2 px-3 mb-2 justify-content-center">
            <Amount
              amount={retractOrWithdrawAmount}
              symbol={isBountyClosed ? rewardTokenSymbol : tokenSymbol}
              symbolColor={isBountyClosed ? "warning" : "primary"}
            />
          </div>

          <h4 className="family-Regular font-weight-normal mb-4">
            {t("funding:modals.retract.from-the")}{" "}
            <span className="text-primary">
              {t("bounty:label")} #{contractId}{" "}
            </span>
            {t("funding:fund")}.
          </h4>
        </Col>
      </Row>

      <RowWithTwoColumns
        col1={
          <Button color="gray" outline onClick={onCloseClick}>
            {t("actions.cancel")}
          </Button>
        }
        col2={
          <ContractButton
            disabled={isExecuting}
            color={isBountyClosed ? "primary" : "danger"}
            onClick={handleRetractOrWithdraw}
          >
            <span>
              {isBountyClosed
                ? t("funding:actions.withdraw-funding")
                : t("funding:actions.retract-funding")}
            </span>
            {isExecuting && (
              <span className="spinner-border spinner-border-xs ml-1" />
            )}
          </ContractButton>
        }
      />
    </Modal>
  );
}
