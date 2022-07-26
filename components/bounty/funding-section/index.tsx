import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import FundModal from "components/bounty/funding-section/fund-modal";
import FundingProgress from "components/bounty/funding-section/funding-progress";
import { Amount, CaptionLarge, CaptionMedium, RowWithTwoColumns } from "components/bounty/funding-section/minimals";
import Button from "components/button";
import Collapsable from "components/collapsable";
import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";

import { BenefactorExtended } from "interfaces/bounty";

import RetractModal from "./retract-modal";

export default function FundingSection() {
  const [showFundModal, setShowFundModal] = useState(false);
  const [walletFunds, setWalletFunds] = useState<BenefactorExtended[]>();
  const [fundingToRetract, setFundingToRetract] = useState<BenefactorExtended>();

  const { networkIssue } = useIssue();
  const { wallet } = useAuthentication();
  
  const isConnected = !!wallet?.address;
  const hasReward = networkIssue?.rewardAmount > 0;
  const isBountyFunded = networkIssue?.fundedAmount >= networkIssue?.fundingAmount;
  const fundsGiven = walletFunds?.reduce((acc, fund) => acc + fund.amount, 0);
  const futureRewards = fundsGiven / networkIssue.fundingAmount * networkIssue.rewardAmount;
  const transactionalSymbol = networkIssue?.transactionalTokenData?.symbol;

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractModal = () => setFundingToRetract(undefined);

  useEffect(() => {
    if (!wallet?.address || !networkIssue) return;

    const funds = 
      networkIssue.funding
        .map((fund, index) => ({ ...fund, id: index }))
        .filter(fund => fund.benefactor.toLowerCase() === wallet.address.toLowerCase() && fund.amount > 0);

    setWalletFunds(funds);
  }, [wallet, networkIssue]);

  if (isBountyFunded && !walletFunds?.length) return <></>;

  return(
    <CustomContainer className="mt-3">
      { (!isConnected && showFundModal) && <ConnectWalletButton asModal={true} />}

      <FundModal 
        show={isConnected && showFundModal} 
        onCloseClick={handleCloseFundModal}
      />

      <RetractModal
        show={!!fundingToRetract}
        fundingToRetract={fundingToRetract}
        onCloseClick={handleCloseRetractModal}
      />

      <RowWithTwoColumns
        col1={<h4 className="family-Regular">Funding</h4>}
        col2={isBountyFunded ? <></> : <Button onClick={handleShowFundModal}>Fund Bounty</Button>}
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
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={networkIssue?.fundedPercent}
          />

          { hasReward &&
            <RowWithTwoColumns
              col1={
                <CaptionLarge 
                  text="Funding Rewards" 
                  color="white" 
                  />
              }
              col2={
                <Amount 
                  amount={networkIssue?.rewardAmount}
                  symbol={networkIssue?.rewardTokenData?.symbol}
                  symbolColor="warning"
                  className="caption-large text-white font-weight-normal"
                />
              }
            />
          }

          { !!walletFunds?.length && 
            <>
              <hr className="bg-disabled" />

              <Row className="bg-dark border-radius-8 py-3 px-2 mx-0">
                <Col>
                  <RowWithTwoColumns
                    col1={<CaptionMedium text="Funds Given" color="white" />}
                    col2={
                      <Amount 
                        amount={fundsGiven}
                        symbol={transactionalSymbol}
                        className="caption-large text-white font-weight-normal"
                      />
                    }
                    filler
                  />

                  <RowWithTwoColumns 
                    col1={<CaptionMedium text="Future Rewards" color="white" />}
                    col2={
                      <Amount 
                        amount={futureRewards}
                        symbol={networkIssue?.rewardTokenData?.symbol}
                        className="caption-large text-white font-weight-normal"
                        symbolColor="warning"
                      />
                    }
                    filler
                  />
                </Col>
              </Row>

              { networkIssue?.isDraft &&
                <Row className="mx-0">
                  <Collapsable
                    labelShow="Manage Funding"
                    labelHide="Manage Funding"
                    labelColor="gray"
                    activeColor="white"
                    className="gap-2"
                  >
                    {walletFunds?.map(fund => 
                      <RowWithTwoColumns 
                        key={`fund-${fund.id}`}
                        className="p-2 bg-shadow border-radius-8"
                        col1={
                          <Amount 
                            amount={fund.amount}
                            symbol={transactionalSymbol}
                            className="caption-large text-white"
                          />
                        }
                        col2={
                          <Button
                            textClass="text-danger p-0"
                            transparent
                            onClick={() => setFundingToRetract(fund)}
                          >
                            Retract Funding
                          </Button>
                        }
                      />)
                    }
                  </Collapsable>
                </Row>
              }
            </>
          }
        </Col>
      </Row>
    </CustomContainer>
  );
}