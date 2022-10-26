import {useContext, useState} from "react";
import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import { handleTokenToEurConversion } from "helpers/handleTokenToEurConversion";

import InputNumber from "./input-number";
import TokensDropdown from "./tokens-dropdown";
import {AppStateContext} from "../contexts/app-state";

export default function CreateBountyTokenAmount({
  currentToken,
  setCurrentToken,
  addToken,
  canAddCustomToken,
  defaultToken = null,
  userAddress,
  customTokens,
  labelSelect,
  tokenBalance,
  issueAmount,
  setIssueAmount,
  review = false,
  needValueValidation,
  decimals = 18
}) {
  const { t } = useTranslation("bounty");
  const {state} = useContext(AppStateContext);

  const [inputError, setInputError] = useState("");
  
  function getCurrentCoin() {
    return customTokens?.find((token) => token?.address === currentToken);
  }

  function handleIssueAmountOnValueChange(values: NumberFormatValues) {
    if(needValueValidation && (+values.floatValue > +currentToken?.currentValue)){
      setIssueAmount({ formattedValue: "" });
      setInputError(t("bounty:errors.exceeds-allowance"))
    } else if (values.floatValue < 0) {
      setIssueAmount({ formattedValue: "" });
    } else if(values.floatValue !== 0 && BigNumber(values.floatValue).isLessThan(BigNumber(state.Settings?.minBountyValue))){
      setInputError(t("bounty:errors.exceeds-minimum-amount",{
        amount: state.Settings?.minBountyValue
      }))
    } else {
      setIssueAmount(values);
      inputError && setInputError("")
    }
  }

  function handleIssueAmountBlurChange() {
    if (needValueValidation && tokenBalance?.lt(issueAmount.floatValue)) {
      setIssueAmount({ formattedValue: tokenBalance.toFixed() });
    }
  }

  function handleMaxValue() {
    if (review) return;
    if (!needValueValidation) return;
    return (
      <div className="text-gray text-uppercase caption-small">
        {t("fields.set")}
        <span
          className="text-primary ms-2 cursor-pointer text-uppercase"
          onClick={() =>
            setIssueAmount({
              formattedValue: tokenBalance.toFixed(),
              floatValue: tokenBalance.toNumber(),
              value: tokenBalance.toFixed()
            })
          }
        >
          {t("fields.amount.max")}
        </span>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="col-md-12 mt-4">
        <TokensDropdown
          token={currentToken}
          label={labelSelect}
          tokens={customTokens}
          userAddress={userAddress}
          canAddToken={canAddCustomToken}
          addToken={addToken}
          setToken={setCurrentToken}
          disabled={review}
          defaultToken={defaultToken}
          showCurrencyValue={needValueValidation}
          needsBalance
        />
      </div>
      <div className="col-md-12">
        <div className="d-flex">
          <InputNumber
            thousandSeparator
            disabled={review || !currentToken?.currentValue}
            max={tokenBalance.toFixed()}
            label={
              <div className="d-flex mb-2">
                <label className="flex-grow-1 caption-small text-gray align-items-center">
                  <span className="mr-1">
                    {t("fields.amount.label")}
                  </span>{" "}
                </label>
                {handleMaxValue()}
              </div>
            }
            symbol={currentToken?.symbol || t("common:misc.token")}
            value={issueAmount.value}
            placeholder="0"
            allowNegative={false}
            decimalScale={decimals}
            onValueChange={handleIssueAmountOnValueChange}
            onBlur={handleIssueAmountBlurChange}
            error={!!inputError}
            helperText={
              <>
              {inputError && <p className="p-small my-2">{inputError}</p>}
              </>
            }
          />
          <div className="mt-4 pt-1 mx-2">
            <ArrowRight className="text-gray" width={9} height={9} />
          </div>
          <InputNumber
            thousandSeparator
            label={" "}
            className="mt-3"
            symbol={"EUR"}
            classSymbol="text-white-30 mt-3"
            allowNegative={false}
            disabled
            value={
              getCurrentCoin()?.tokenInfo
                ? handleTokenToEurConversion(Number(issueAmount.value),
                                             getCurrentCoin()?.tokenInfo?.prices["eur"])
                : "0"
            }
            placeholder="-"
            helperText={
              <>
                {!getCurrentCoin()?.tokenInfo && !review && (
                  <p className="p-small text-danger">
                    {t("fields.conversion-token.invalid")}
                  </p>
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
