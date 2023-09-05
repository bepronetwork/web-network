import { Form } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import If from "components/If";
import ResponsiveWrapper from "components/responsive-wrapper";

import { RewardInformationViewProps } from "types/components";

import CreateBountyRewardInfo from "../../create-bounty-reward-info";
import CreateBountyTokenAmount from "../../token-amount/create-bounty-token-amount";
import RewardInformationBalanceView from "./balance/view";

export default function RewardInformationSectionView({
  transactionalToken,
  rewardToken,
  isFundingType,
  currentUserWallet,
  rewardChecked,
  bountyDecimals,
  rewardDecimals,
  issueAmount,
  rewardAmount,
  bountyTokens,
  rewardTokens,
  rewardBalance,
  bountyBalance,
  updateRewardToken,
  updateTransactionalToken,
  addToken,
  handleRewardChecked,
  updateIssueAmount,
  updateRewardAmount,
  updateIsFunding,
}: RewardInformationViewProps) {
  const { t } = useTranslation(["common", "bounty"]);

  function renderBountyToken(type: "bounty" | "reward") {
    const fieldParams = {
      bounty: {
        token: transactionalToken,
        setToken: updateTransactionalToken,
        default: transactionalToken,
        decimals: bountyDecimals,
        amount: issueAmount,
        setAmount: updateIssueAmount,
        tokens: bountyTokens,
        balance: bountyBalance,
        isFunding: isFundingType,
        label: t("bounty:fields.select-token.bounty", {
          set: t("bounty:fields.set"),
        }),
      },
      reward: {
        token: rewardToken,
        setToken: updateRewardToken,
        default: rewardToken,
        decimals: rewardDecimals,
        amount: rewardAmount,
        setAmount: updateRewardAmount,
        tokens: rewardTokens,
        balance: rewardBalance,
        isFunding: isFundingType,
        label: t("bounty:fields.select-token.reward", {
          set: t("bounty:fields.set"),
        }),
      },
    };

    return (
      <>
        <CreateBountyTokenAmount
          currentToken={fieldParams[type].token}
          setCurrentToken={fieldParams[type].setToken}
          customTokens={fieldParams[type].tokens}
          userAddress={currentUserWallet}
          defaultToken={fieldParams[type].default}
          canAddCustomToken={false}
          addToken={addToken}
          decimals={fieldParams[type].decimals}
          issueAmount={fieldParams[type].amount}
          setIssueAmount={fieldParams[type].setAmount}
          tokenBalance={fieldParams[type].balance}
          isFunders={type === "reward" ? false : true}
          needValueValidation={!isFundingType || type === "reward"}
          isFunding={isFundingType}
          labelSelect={fieldParams[type].label}
        />
      </>
    );
  }

  return (
    <CreateBountyRewardInfo
      isFunding={isFundingType}
      updateIsFunding={updateIsFunding}
    >
      <If 
        condition={isFundingType}
        otherwise={renderBountyToken("bounty")}
      >
        <>
          {renderBountyToken("bounty")}
          <div className="d-flex flex-row align-items-center justify-content-between mt-4">
            <div>
              <div className="d-flex">
                <label className="me-3">
                  {t("bounty:reward-funders")}
                </label>

                <Form.Check
                  className="form-control-md mb-1"
                  type="switch"
                  id="custom-switch"
                  onChange={handleRewardChecked}
                  checked={rewardChecked}
                />
              </div>

              <p className="text-gray">
                {t("bounty:reward-funders-description")}
              </p>
            </div>

            <ResponsiveWrapper className="mt-1" xs={false} md={true}>
              {rewardChecked && (
                <RewardInformationBalanceView
                  amount={rewardBalance.toFixed()}
                  symbol={rewardToken?.symbol}
                />
              )}
            </ResponsiveWrapper>
          </div>
        </>
      </If>

      <If condition={rewardChecked && isFundingType}>
        {renderBountyToken("reward")}
      </If>
    </CreateBountyRewardInfo>
  );
}