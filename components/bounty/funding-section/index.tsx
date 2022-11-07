import {useContext, useEffect, useState} from "react";
import { Col, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import FundModal from "components/bounty/funding-section/fund-modal";
import FundingProgress from "components/bounty/funding-section/funding-progress";
import { Amount, CaptionLarge, CaptionMedium, RowWithTwoColumns } from "components/bounty/funding-section/minimals";
import Button from "components/button";
import Collapsable from "components/collapsable";
import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";

import { getIssueState } from "helpers/handleTypeIssue";

import { fundingBenefactor } from "interfaces/issue-data";

import {AppStateContext, useAppState} from "../../../contexts/app-state";
import RetractOrWithdrawModal from "./retract-or-withdraw-modal";

export default function FundingSection() {
  const { t } = useTranslation(["common", "funding"]);

  const [showFundModal, setShowFundModal] = useState(false);
  const [walletFunds, setWalletFunds] = useState<fundingBenefactor[]>();
  const [fundingToRetractOrWithdraw, setFundingToRetractOrWithdraw] = useState<fundingBenefactor>();

  const {state} = useAppState();

  const isConnected = !!state.currentUser?.walletAddress;
  const hasReward = state.currentBounty?.chainData?.rewardAmount?.gt(0);
  const isBountyClosed = !!state.currentBounty?.chainData?.closed;
  const isBountyFunded = !!state.currentBounty?.chainData?.funded;
  const isBountyInDraft = !!state.currentBounty?.chainData?.isDraft;
  const transactionalSymbol = state.currentBounty?.chainData?.transactionalTokenData?.symbol;
  const rewardTokenSymbol = state.currentBounty?.chainData?.rewardTokenData?.symbol;

  const fundsGiven = walletFunds?.reduce((acc, fund) => fund.amount.plus(acc), BigNumber(0)) || BigNumber(0);
  
  const futureRewards = 
    fundsGiven.multipliedBy(state.currentBounty?.chainData?.rewardAmount).dividedBy(state.currentBounty?.chainData?.fundingAmount).toFixed();
  
  const isCanceled = getIssueState({
    state: state.currentBounty?.data?.state,
    amount: state.currentBounty?.data?.amount,
    fundingAmount: state.currentBounty?.data?.fundingAmount,
  }) === "canceled";

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractOrWithdrawModal = () => setFundingToRetractOrWithdraw(undefined);

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.currentBounty?.chainData) return;

    const funds: any[] =
      state.currentBounty?.chainData.funding
        .map((fund, index) => ({ ...fund, id: index }))
        .filter(fund => fund.benefactor.toLowerCase() === state.currentUser.walletAddress.toLowerCase() && fund.amount.gt(0)) || [];

    setWalletFunds(funds);
  }, [state.currentUser, state.currentBounty?.chainData]);

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
            fundedAmount={state.currentBounty?.chainData?.fundedAmount?.toFixed()}
            fundingAmount={state.currentBounty?.chainData?.fundingAmount?.toFixed()}
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={state.currentBounty?.chainData?.fundedPercent?.toFixed(2, 1)}
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
                  amount={state.currentBounty?.chainData?.rewardAmount?.toFixed()}
                  symbol={state.currentBounty?.chainData?.rewardTokenData?.symbol}
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
                          symbol={state.currentBounty?.chainData?.rewardTokenData?.symbol}
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
                  labelShow={t("funding:actions.manage-funding")}
                  labelHide={t("funding:actions.manage-funding")}
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
                                      .dividedBy(state.currentBounty?.chainData.fundingAmount)
                                      .multipliedBy(state.currentBounty?.chainData.rewardAmount)
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
                          (isBountyInDraft || isBountyClosed && hasReward && !fund.isWithdrawn) && (
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