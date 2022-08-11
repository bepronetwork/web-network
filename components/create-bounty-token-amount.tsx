import { NumberFormatValues } from "react-number-format";

import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import { handleTokenToEurConversion } from "helpers/handleTokenToEurConversion";

import InputNumber from "./input-number";
import TokensDropdown from "./tokens-dropdown";

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
  isFundingType,
}) {
  const { t } = useTranslation("bounty");

  function getCurrentCoin() {
    return customTokens?.find((token) => token?.address === currentToken);
  }

  function handleIssueAmountOnValueChange(values: NumberFormatValues) {
    if (values.floatValue < 0) {
      setIssueAmount({ formattedValue: "" });
    } else {
      setIssueAmount(values);
    }
  }

  function handleIssueAmountBlurChange() {
    if (isFundingType && issueAmount.floatValue > tokenBalance) {
      setIssueAmount({ formattedValue: tokenBalance.toString() });
    }
  }

  function handleMaxValue() {
    if (review) return;
    if (!isFundingType) return;
    return (
      <div className="text-gray text-uppercase caption-small">
        {t("fields.set")}
        <span
          className="text-primary ms-2 cursor-pointer text-uppercase"
          onClick={() =>
            setIssueAmount({
              formattedValue: tokenBalance.toString(),
              floatValue: tokenBalance,
              value: tokenBalance.toString()
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
          needsBalance
        />
      </div>
      <div className="col-md-12">
        <div className="d-flex">
          <InputNumber
            thousandSeparator
            disabled={review}
            max={tokenBalance}
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
            value={issueAmount.formattedValue}
            placeholder="0"
            onValueChange={handleIssueAmountOnValueChange}
            onBlur={handleIssueAmountBlurChange}
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
            disabled={true}
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
