import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import FundModal from "components/bounty/funding-section/fund-modal";
import FundingProgress from "components/bounty/funding-section/funding-progress";
import { CaptionMedium, RowWithTwoColumns } from "components/bounty/funding-section/minimals";
import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";

export default function FundingSection() {
  const [showFundModal, setShowFundModal] = useState(false);

  const { networkIssue } = useIssue();
  const { wallet } = useAuthentication();
  
  const isConnected = !!wallet?.address;

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);

  return(
    <CustomContainer className="mt-3">
      { (!isConnected && showFundModal) && <ConnectWalletButton asModal={true} />}

      <FundModal 
        show={isConnected && showFundModal} 
        onCloseClick={handleCloseFundModal}
      />

      <RowWithTwoColumns
        col1={<h4 className="family-Regular">Funding</h4>}
        col2={<Button onClick={handleShowFundModal}>Fund Bounty</Button>}
      />

      <Row className="border-radius-8 bg-shadow mt-3 mx-0 p-2 border border-disabled">
        <Col className="d-grid gap-2">
          <RowWithTwoColumns
            col1={<CaptionMedium text="Current Funding" />}
            col2={<CaptionMedium text="Total Amount" />}
          />

          <FundingProgress
            fundedAmount={networkIssue?.fundedAmount}
            fundingAmount={networkIssue?.fundingAmount}
            fundingTokenSymbol={networkIssue?.transactionalTokenData?.symbol}
            fundedPercent={networkIssue?.fundedPercent}
          />
        </Col>
      </Row>
    </CustomContainer>
  );
}