import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import FundModal from "components/bounty/funding-section/fund-modal/controller";
import FundingProgress from "components/bounty/funding-section/funding-progress/controller";
import {
  Amount,
  CaptionLarge,
  CaptionMedium,
  RowWithTwoColumns,
} from "components/bounty/funding-section/minimals.view";
import RetractOrWithdrawModal from "components/bounty/funding-section/retract-or-withdraw-modal/controller";
import Collapsable from "components/collapsable";
import ConnectWalletButton from "components/connect-wallet-button";
import ContractButton from "components/contract-button";


import {IssueBigNumberData, fundingBenefactor} from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

interface FundingSectionViewProps {
    walletFunds: fundingBenefactor[];
    isBountyFunded: boolean;
    isConnected: boolean;
    isCanceled: boolean;
    transactionalSymbol: string;
    bounty: IssueBigNumberData;
    hasReward: boolean;
    fundsGiven: BigNumber;
    futureRewards: string;
    collapseAction: string;
    isBountyClosed: boolean;
    isBountyInDraft: boolean;
    rewardTokenSymbol: string;
    updateBountyData: (updatePrData?: boolean) => void;
}

export default function FundingSectionView({
    walletFunds,
    isBountyFunded,
    isConnected,
    isCanceled,
    transactionalSymbol,
    bounty,
    hasReward,
    fundsGiven,
    futureRewards,
    collapseAction,
    isBountyClosed,
    isBountyInDraft,
    rewardTokenSymbol,
    updateBountyData
}: FundingSectionViewProps) {
  const { t } = useTranslation(["common", "funding"]);

  const { isMobileView, isTabletView } = useBreakPoint();

  const [showFundModal, setShowFundModal] = useState(false);
  const [fundingToRetractOrWithdraw, setFundingToRetractOrWithdraw] = useState<fundingBenefactor>();


  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractOrWithdrawModal = () => setFundingToRetractOrWithdraw(undefined);


  if (isBountyFunded && !walletFunds?.length) return <></>;

  return(
    <div className="container mt-3">
      { (!isConnected && showFundModal) && <ConnectWalletButton asModal={true} />}

      <FundModal 
        show={isConnected && showFundModal} 
        onCloseClick={handleCloseFundModal}
        updateBountyData={updateBountyData}
        currentBounty={bounty}
      />

      <RetractOrWithdrawModal
        updateBountyData={updateBountyData}
        currentBounty={bounty}
        show={!!fundingToRetractOrWithdraw}
        funding={fundingToRetractOrWithdraw}
        onCloseClick={handleCloseRetractOrWithdrawModal}
      />

      <RowWithTwoColumns
        col1={<h4 className="family-Regular d-none d-lg-block">{t("funding:title")}</h4>}
        col2={isBountyFunded || isCanceled ? <></> : 
          <ContractButton onClick={handleShowFundModal} className="col-12">
            {t("funding:actions.fund-bounty")}
          </ContractButton>}
        classNameCol2={(isTabletView || isMobileView) && 'col-12'}
      />
      
      <Row className="border-radius-8 bg-gray-850 mt-3 mx-0 p-2">
        <Col className="d-grid gap-2">
          <RowWithTwoColumns
            col1={<CaptionMedium text={t("funding:current-funding")} />}
            col2={<CaptionMedium text={t("funding:total-amount")} />}
          />

          <FundingProgress
            fundedAmount={bounty?.fundedAmount?.toFixed()}
            fundingAmount={bounty?.fundingAmount?.toFixed()}
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={bounty?.fundedPercent?.toString()}
          />

          { hasReward &&
            <RowWithTwoColumns
              col1={
                <CaptionLarge 
                  text={t("funding:funding-rewards")}
                  color="white" 
                  />
              }
              col2={
                <Amount 
                  amount={bounty?.rewardAmount?.toFixed()}
                  symbol={bounty?.rewardToken?.symbol}
                  symbolColor="warning"
                  className="caption-large text-white font-weight-normal"
                />
              }
            />
          }
          {!!walletFunds?.length && 
            <>
              <hr className="bg-disabled" />

              <Row className="bg-dark border-radius-8 py-3 px-2 mx-0">
                <Col>
                  <RowWithTwoColumns
                    col1={<CaptionMedium text={t("funding:funds-given")} color="white" />}
                    col2={
                      <Amount 
                        amount={fundsGiven.toFixed()}
                        symbol={transactionalSymbol}
                        className="caption-large text-white font-weight-normal"
                      />
                    }
                    filler
                  />
                  
                  { hasReward &&
                    <RowWithTwoColumns 
                      col1={<CaptionMedium text={t("funding:future-rewards")} color="white" />}
                      col2={
                        <Amount 
                          amount={futureRewards}
                          symbol={bounty?.rewardToken?.symbol}
                          className="caption-large text-white font-weight-normal"
                          symbolColor="warning"
                        />
                      }
                      filler
                    />
                  }
                </Col>
              </Row>

              <Row className="mx-0">
                <Collapsable
                  labelShow={collapseAction}
                  labelHide={collapseAction}
                  labelColor="gray"
                  activeColor="white"
                  className="gap-2"
                >
                  {walletFunds?.map(fund => 
                  <>
                    <RowWithTwoColumns 
                      key={`fund-${fund.contractId}`}
                      className="p-2 bg-shadow border-radius-8"
                      col1={
                        <>
                        <Amount 
                          amount={fund.amount.toFixed()}
                          symbol={transactionalSymbol}
                          className="caption-large text-white"
                        />
                            {(isBountyClosed && hasReward) && (
                              <>
                                <ArrowRight className="mx-2" />
                                <span className="caption-medium me-2 text-uppercase">
                                  {t("funding:reward")}
                                </span>
                                <Amount
                                  amount={
                                    fund.amount
                                      .dividedBy(bounty?.fundingAmount)
                                      .multipliedBy(bounty?.rewardAmount)
                                      .toFixed()
                                  }
                                  symbol={rewardTokenSymbol}
                                  symbolColor="warning"
                                  className="caption-large text-white"
                                />
                              </>
                            )}
                      </>
                      }
                      col2={
                          (isBountyInDraft || isBountyClosed && hasReward && !fund.withdrawn) && (
                            <ContractButton
                            textClass={`${isBountyClosed ? "text-primary" : 'text-danger'} p-0`}
                            transparent
                            onClick={() => setFundingToRetractOrWithdraw(fund)}
                          >
                            {isBountyClosed
                              ? t("funding:actions.withdraw-funding")
                              : t("funding:actions.retract-funding")}
                          </ContractButton>
                          )
                      }
                    />
                    </>)
                  }

                </Collapsable>
              </Row>
            </>
          }
        </Col>
      </Row>
    </div>
  );
}