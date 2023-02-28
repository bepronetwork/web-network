import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import FundModal from "components/bounty/funding-section/fund-modal";
import FundingProgress from "components/bounty/funding-section/funding-progress";
import {Amount, CaptionLarge, CaptionMedium, RowWithTwoColumns} from "components/bounty/funding-section/minimals";
import RetractOrWithdrawModal from "components/bounty/funding-section/retract-or-withdraw-modal";
import Button from "components/button";
import Collapsable from "components/collapsable";
import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";

import {useAppState} from "contexts/app-state";

import {getIssueState} from "helpers/handleTypeIssue";

import {fundingBenefactor} from "interfaces/issue-data";

export default function FundingSection() {
  const { t } = useTranslation(["common", "funding"]);

  const [showFundModal, setShowFundModal] = useState(false);
  const [walletFunds, setWalletFunds] = useState<fundingBenefactor[]>();
  const [fundingToRetractOrWithdraw, setFundingToRetractOrWithdraw] = useState<fundingBenefactor>();

  const {state} = useAppState();

  const isConnected = !!state.currentUser?.walletAddress;
  const hasReward = state.currentBounty?.data?.hasReward;
  const isBountyClosed = !!state.currentBounty?.data?.isClosed;
  const isBountyFunded = !!state.currentBounty?.data?.isFunded;
  const isBountyInDraft = !!state.currentBounty?.data?.isDraft;
  const transactionalSymbol = state.currentBounty?.data?.transactionalToken?.symbol;
  const rewardTokenSymbol = state.currentBounty?.data?.rewardToken?.symbol;

  const fundsGiven = walletFunds?.reduce((acc, fund) => fund.amount.plus(acc), BigNumber(0)) || BigNumber(0);
  
  const futureRewards = fundsGiven.multipliedBy(state.currentBounty?.data?.rewardAmount)
    .dividedBy(state.currentBounty?.data?.fundingAmount).toFixed();

  const collapseAction = isBountyClosed ? t("funding:rewards") :  t("funding:actions.manage-funding");
  
  const isCanceled = getIssueState({
    state: state.currentBounty?.data?.state,
    amount: state.currentBounty?.data?.amount,
    fundingAmount: state.currentBounty?.data?.fundingAmount,
  }) === "canceled";

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractOrWithdrawModal = () => setFundingToRetractOrWithdraw(undefined);

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.currentBounty?.data) return;
  
    const funds = state.currentBounty?.data?.benefactors
        .filter(fund => fund.address === state.currentUser.walletAddress);

    setWalletFunds(funds);
  }, [state.currentUser, state.currentBounty?.data, state.currentBounty?.data]);

  if (isBountyFunded && !walletFunds?.length) return <></>;

  return(
    <CustomContainer className="mt-3">
      { (!isConnected && showFundModal) && <ConnectWalletButton asModal={true} />}

      <FundModal 
        show={isConnected && showFundModal} 
        onCloseClick={handleCloseFundModal}
      />

      <RetractOrWithdrawModal
        show={!!fundingToRetractOrWithdraw}
        funding={fundingToRetractOrWithdraw}
        onCloseClick={handleCloseRetractOrWithdrawModal}
      />

      <RowWithTwoColumns
        col1={<h4 className="family-Regular">{t("funding:title")}</h4>}
        col2={isBountyFunded || isCanceled ? <></> : 
          <Button onClick={handleShowFundModal}>
            {t("funding:actions.fund-bounty")}
          </Button>}
      />
      
      <Row className="border-radius-8 bg-shadow mt-3 mx-0 p-2 border border-disabled">
        <Col className="d-grid gap-2">
          <RowWithTwoColumns
            col1={<CaptionMedium text={t("funding:current-funding")} />}
            col2={<CaptionMedium text={t("funding:total-amount")} />}
          />

          <FundingProgress
            fundedAmount={state.currentBounty?.data?.fundedAmount?.toFixed()}
            fundingAmount={state.currentBounty?.data?.fundingAmount?.toFixed()}
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={state.currentBounty?.data?.fundedPercent?.toString()}
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
                  amount={state.currentBounty?.data?.rewardAmount?.toFixed()}
                  symbol={state.currentBounty?.data?.rewardToken?.symbol}
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
                          symbol={state.currentBounty?.data?.rewardToken?.symbol}
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
                                      .dividedBy(state.currentBounty?.data?.fundingAmount)
                                      .multipliedBy(state.currentBounty?.data?.rewardAmount)
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
                            <Button
                            textClass={`${isBountyClosed ? "text-primary" : 'text-danger'} p-0`}
                            transparent
                            onClick={() => setFundingToRetractOrWithdraw(fund)}
                          >
                            {isBountyClosed
                              ? t("funding:actions.withdraw-funding")
                              : t("funding:actions.retract-funding")}
                          </Button>
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
    </CustomContainer>
  );
}