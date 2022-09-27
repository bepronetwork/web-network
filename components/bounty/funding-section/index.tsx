import { useEffect, useState } from "react";
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

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";

import { getIssueState } from "helpers/handleTypeIssue";

import { BenefactorExtended } from "interfaces/bounty";

import RetractOrWithdrawModal from "./retract-or-withdraw-modal";


export default function FundingSection() {
  const { t } = useTranslation(["common", "funding"]);

  const [showFundModal, setShowFundModal] = useState(false);
  const [walletFunds, setWalletFunds] = useState<BenefactorExtended[]>();
  const [fundingtoRetractOrWithdraw, setFundingToRetractOrWithdraw] = useState<BenefactorExtended>();

  const { networkIssue, activeIssue } = useIssue();
  const { wallet } = useAuthentication();
  
  const isConnected = !!wallet?.address;
  const hasReward = networkIssue?.rewardAmount?.gt(0);
  const isBountyFunded = !!networkIssue?.funded;
  const fundsGiven = walletFunds?.reduce((acc, fund) => fund.amount.plus(acc), BigNumber(0)) || BigNumber(0);
  const futureRewards = 
    fundsGiven.multipliedBy(networkIssue?.rewardAmount).dividedBy(networkIssue?.fundingAmount).toString();
  const transactionalSymbol = networkIssue?.transactionalTokenData?.symbol;
  const rewardTokenSymbol = networkIssue?.rewardTokenData?.symbol;
  const isCanceled = getIssueState({
    state: activeIssue?.state,
    amount: activeIssue?.amount,
    fundingAmount: activeIssue?.fundingAmount,
  }) === "canceled"

  const handleShowFundModal = () => setShowFundModal(true);
  const handleCloseFundModal = () => setShowFundModal(false);
  const handleCloseRetractOrWithdrawModal = () => setFundingToRetractOrWithdraw(undefined);

  useEffect(() => {
    if (!wallet?.address || !networkIssue) return;

    const funds =
      networkIssue.funding
        .map((fund, index) => ({ ...fund, id: index }))
        .filter(fund => fund.benefactor.toLowerCase() === wallet.address.toLowerCase() && fund.amount.gt(0));

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

      <RetractOrWithdrawModal
        show={!!fundingtoRetractOrWithdraw}
        funding={fundingtoRetractOrWithdraw}
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
            fundedAmount={networkIssue?.fundedAmount?.toString()}
            fundingAmount={networkIssue?.fundingAmount?.toString()}
            fundingTokenSymbol={transactionalSymbol}
            fundedPercent={networkIssue?.fundedPercent}
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
                  amount={networkIssue?.rewardAmount?.toString()}
                  symbol={networkIssue?.rewardTokenData?.symbol}
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
                        amount={fundsGiven.toString()}
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
                          symbol={networkIssue?.rewardTokenData?.symbol}
                          className="caption-large text-white font-weight-normal"
                          symbolColor="warning"
                        />
                      }
                      filler
                    />
                  }
                </Col>
              </Row>
              { (networkIssue?.isDraft || !isBountyFunded || networkIssue?.closed) &&
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
                        key={`fund-${fund.id}`}
                        className="p-2 bg-shadow border-radius-8"
                        col1={
                          <>
                          <Amount 
                            amount={fund.amount.toString()}
                            symbol={transactionalSymbol}
                            className="caption-large text-white"
                          />
                              {networkIssue?.closed && networkIssue?.rewardAmount?.gt(0) && (
                                <>
                                  <ArrowRight className="mx-2" />
                                  <span className="caption-medium me-2 text-uppercase">
                                    {t("funding:reward")}
                                  </span>
                                  <Amount
                                    amount={
                                      fund.amount
                                        .dividedBy(networkIssue.fundingAmount)
                                        .multipliedBy(networkIssue.rewardAmount)
                                        .toString()
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
                            networkIssue?.closed && networkIssue?.rewardAmount?.gt(0) && (
                              <Button
                              textClass={`${networkIssue?.closed ? "text-primary" : 'text-danger'} p-0`}
                              transparent
                              onClick={() => setFundingToRetractOrWithdraw(fund)}
                            >
                              {networkIssue?.closed
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
              }
            </>
          }
        </Col>
      </Row>
    </CustomContainer>
  );
}