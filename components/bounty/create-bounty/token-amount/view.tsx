import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import AmountTokenInformation from "components/bounty/amount-token-information/view";
import ResponsiveWrapper from "components/responsive-wrapper";

import { DistributionsProps } from "interfaces/proposal";
import { Token } from "interfaces/token";

import InputNumber from "../../../input-number";
import TokensDropdown from "../../../tokens-dropdown";
import RewardInformationBalanceView from "../sections/reward-information/balance/view";
import ServiceFeesModalView from "../service-fees-modal/view";

interface CreateBountyTokenAmountViewProps {
  currentToken: Token;
  updateCurrentToken: (v: Token) => void;
  addToken: (v: Token) => Promise<void>;
  onIssueAmountValueChange: (
    values: NumberFormatValues,
    type: "reward" | "total"
  ) => void;
  canAddCustomToken: boolean;
  defaultToken: Token;
  userAddress: string;
  customTokens: Token[];
  labelSelect: string;
  tokenBalance: BigNumber;
  issueAmount: NumberFormatValues;
  rewardAmount: NumberFormatValues;
  isFunders: boolean;
  decimals: number;
  isFunding: boolean;
  inputError: string;
  showFeesModal: boolean;
  updateShowFeesModal: (v: boolean) => void;
  distributions: DistributionsProps;
}

export default function CreateBountyTokenAmountView({
  currentToken,
  updateCurrentToken,
  addToken,
  onIssueAmountValueChange,
  canAddCustomToken,
  defaultToken = null,
  userAddress,
  customTokens,
  labelSelect,
  tokenBalance,
  issueAmount,
  rewardAmount,
  isFunders = false,
  decimals = 18,
  isFunding = false,
  inputError,
  showFeesModal,
  updateShowFeesModal,
  distributions,
}: CreateBountyTokenAmountViewProps) {
  const { t } = useTranslation(["bounty", "common", "proposal"]);

  function selectTokens() {
    return (
      <TokensDropdown
        token={currentToken}
        label={labelSelect}
        tokens={customTokens}
        userAddress={userAddress}
        canAddToken={canAddCustomToken}
        addToken={addToken}
        setToken={updateCurrentToken}
        disabled={false}
        defaultToken={defaultToken}
        showCurrencyValue={false}
        needsBalance={isFunding}
        noLabel
      />
    );
  }

  function inputNumber() {
    return (
      <InputNumber
        symbol={currentToken?.symbol}
        classSymbol=""
        thousandSeparator
        value={issueAmount?.value}
        placeholder="0"
        allowNegative={false}
        max={tokenBalance.toFixed()}
        decimalScale={decimals}
        onValueChange={(e) =>
          e.value !== issueAmount.value && onIssueAmountValueChange(e, "total")
        }
        error={!!inputError}
        helperText={
          <>{inputError && <p className="p-small">{inputError}</p>}</>
        }
      />
    );
  }

  function RenderBalance() {
    if (isFunding && isFunders) return null;
    return (
      <RewardInformationBalanceView
        amount={tokenBalance.toFixed()}
        symbol={currentToken?.symbol}
      />
    );
  }

  function renderPrimaryToken() {
    return (
      <div>
        <div className="row d-flex flex-wrap justify-content-between">
          <div className="col col-md-5 mb-0 pb-0">
            {selectTokens()}
            <ResponsiveWrapper className="mt-1" xs={true} md={false}>
              <RenderBalance />
            </ResponsiveWrapper>
          </div>

          <ResponsiveWrapper
            className="d-flex justify-content-end mt-3"
            xs={false}
            md={true}
          >
            <RenderBalance />
          </ResponsiveWrapper>
        </div>

        <AmountTokenInformation 
          isFunding={isFunding} 
          currentToken={currentToken} 
          rewardAmount={rewardAmount} 
          issueAmount={issueAmount} 
          tokenBalance={tokenBalance} 
          decimals={decimals} 
          inputError={inputError} 
          distributions={distributions} 
          onIssueAmountValueChange={onIssueAmountValueChange}      
          updateShowFeesModal={() => updateShowFeesModal(true)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-4">
        <label className="mb-1 text-gray">
          {isFunding
            ? isFunders
              ? t("fields.select-token.label")
              : t("fields.select-token.reward")
            : t("fields.select-token.label")}
        </label>
        {isFunding ? (
          isFunders ? (
            renderPrimaryToken()
          ) : (
            <div className="row d-flex flex-wrap justify-content-between">
              <div className="col col-md-5 mb-0 pb-0">
                {selectTokens()}
                <ResponsiveWrapper className="mt-1 mb-4" xs={true} md={false}>
                  <RenderBalance />
                </ResponsiveWrapper>
              </div>
              <div className="col-md-4 col-12">{inputNumber()}</div>
            </div>
          )
        ) : (
          renderPrimaryToken()
        )}
      </div>
      <ServiceFeesModalView
        show={showFeesModal}
        onClose={() => updateShowFeesModal(false)}
        symbol={currentToken?.symbol}
        distributions={distributions}
      />
    </>
  );
}
