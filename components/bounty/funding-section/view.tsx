import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import FundModal from "components/bounty/funding-section/fund-modal/controller";
import FundingProgress from "components/bounty/funding-section/funding-progress/controller";
import {
  Amount,
  CaptionMedium,
  RowWithTwoColumns,
} from "components/bounty/funding-section/minimals.view";
import RetractOrWithdrawModal from "components/bounty/funding-section/retract-or-withdraw-modal/controller";
import Collapsable from "components/collapsable";
import ConnectWalletButton from "components/connect-wallet-button";
import ContractButton from "components/contract-button";
import If from "components/If";

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
    isBountyClosed,
    isBountyInDraft,
    rewardTokenSymbol,
    updateBountyData
}: FundingSectionViewProps) {
  const { t } = useTranslation(["common", "funding"]);

  const [showFundModal, setShowFundModal] = useState(false);
  const [fundingToRetractOrWithdraw, setFundingToRetractOrWithdraw] = useState<fundingBenefactor>();

  const { isMobileView, isTabletView } = useBreakPoint();

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractOrWithdrawModal = () => setFundingToRetractOrWithdraw(undefined);

  if (isBountyFunded && !walletFunds?.length) return <></>;

  const collapseAction = isBountyClosed ? t("funding:rewards") : t("funding:actions.manage-funding");
  const FundsGivenAmount = 
    <Amount 
      amount={fundsGiven.toFixed()}
      symbol={transactionalSymbol}
      className="caption-medium text-white font-weight-normal"
    />;

  return(
    <div className="mt-3">
      <If condition={!isConnected && showFundModal}>
        <ConnectWalletButton asModal={true} />
      </If>

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
        col1={
          <h4 className="family-Regular d-none d-lg-block">
            {t("funding:title")}
          </h4>
        }
        col2={
          <If condition={!isBountyFunded && !isCanceled}>
            <ContractButton onClick={handleShowFundModal} className="col-12">
              {t("funding:actions.fund-bounty")}
            </ContractButton>
          </If>
        }
        classNameCol2={(isTabletView || isMobileView) && 'col-12'}
      />
      
      <Collapsable
        labelShow={FundsGivenAmount}
        labelHide={FundsGivenAmount}
        isCollapsed={isBountyFunded}
        labelColor="gray-200"
        activeColor="white"
        className="gap-2 bg-gray-900"
        headerTitle="Funds given"
        containerClassName="bg-gray-900 mt-3 p-3 border-radius-8 border border-gray-800"
      >
        <Col className="mt-4 d-grid gap-2">
          <RowWithTwoColumns
            col1={
              <CaptionMedium text={t("funding:current-funding")} color="gray-600" />
            }
            col2={
              <CaptionMedium text={t("funding:total-amount")} color="gray-600" />
            }
          />

          <FundingProgress
            fundedAmount={bounty?.fundedAmount?.toFixed()}
            fundingAmount={bounty?.fundingAmount?.toFixed()}
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={bounty?.fundedPercent?.toString()}
          />

          <If condition={hasReward}>
            <RowWithTwoColumns
              col1={
                <CaptionMedium 
                  text={t("funding:funding-rewards")}
                  color="gray-600" 
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
          </If>

          <If condition={!!walletFunds?.length}>
            <>
              <hr className="bg-disabled" />

              <Row className="bg-dark border-radius-8 py-3 px-2 mx-0">
                <Col>
                  <RowWithTwoColumns
                    col1={
                      <CaptionMedium text={t("funding:funds-given")} color="white" />
                    }
                    col2={
                      <Amount 
                        amount={fundsGiven.toFixed()}
                        symbol={transactionalSymbol}
                        className="caption-large text-white font-weight-normal"
                      />
                    }
                    filler
                  />

                  <If condition={hasReward}>
                    <RowWithTwoColumns 
                      col1={
                        <CaptionMedium text={t("funding:future-rewards")} color="white" />
                      }
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
                  </If>
                </Col>
              </Row>

              <Row className="mt-1 mx-0">
                <Collapsable
                  labelShow={collapseAction}
                  labelHide={collapseAction}
                  labelColor="gray"
                  activeColor="white"
                  className="gap-2 mt-2 bg-gray-900"
                >
                  {walletFunds?.map(fund => 
                    <>
                      <RowWithTwoColumns 
                        key={`fund-${fund.contractId}`}
                        className="p-2 bg-dark border-radius-8"
                        col1={
                          <div className="d-flex align-items-center">
                            <Amount 
                              amount={fund.amount.toFixed()}
                              symbol={transactionalSymbol}
                              className="caption-large text-white"
                            />
                            <If condition={isBountyClosed && hasReward}>
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
                            </If>
                          </div>
                        }
                        col2={
                          <If condition={isBountyInDraft || isBountyClosed && hasReward && !fund.withdrawn}>
                            <ContractButton
                              textClass={`${isBountyClosed ? "text-primary" : 'text-danger'} p-0`}
                              transparent
                              onClick={() => setFundingToRetractOrWithdraw(fund)}
                            >
                              {isBountyClosed
                                ? t("funding:actions.withdraw-funding")
                                : t("funding:actions.retract-funding")}
                            </ContractButton>
                          </If>
                        }
                      />
                    </>)
                  }
                </Collapsable>
              </Row>
            </>
          </If>
        </Col>
      </Collapsable>
    </div>
  );
}