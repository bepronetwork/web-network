import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";
import InfoIconEmpty from "assets/icons/info-icon-empty";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { handleTokenToEurConversion } from "helpers/handleTokenToEurConversion";

import InputNumber from "./input-number";
import TokensDropdown from "./tokens-dropdown";

export default function CreateBountyTokenAmount({
  currentToken,
  setCurrentToken,
  isCurrentTokenApproved,
  addToken,
  canAddCustomToken,
  defaultToken,
  userAddress,
  customTokens,
  labelSelect,
  tokenBalance,
  issueAmount,
  setIssueAmount,
  coinInfo,
  handleAmountOnValueChange,
  handleAmountBlurChange,
  review = false,
}) {
  const { t } = useTranslation(["create-bounty"]);

  return (
    <>
      <div className="col-md-12 mt-4">
        <TokensDropdown
          label={labelSelect}
          tokens={customTokens}
          userAddress={userAddress}
          defaultToken={defaultToken}
          canAddToken={canAddCustomToken}
          addToken={addToken}
          setToken={setCurrentToken}
          disabled={review}
        />
      </div>
      <div className="col-md-12">
        <div className="d-flex">
          <InputNumber
            thousandSeparator
            disabled={review}
            max={tokenBalance}
            label={t("create-bounty:fields.amount.label", {
              token: currentToken?.symbol,
            })}
            symbol={currentToken?.symbol}
            value={issueAmount.formattedValue}
            placeholder="0"
            onValueChange={handleAmountOnValueChange}
            onBlur={handleAmountBlurChange}
            helperText={
              <>
                {t("create-bounty:fields.amount.info", {
                  token: currentToken?.symbol,
                  amount: formatNumberToCurrency(tokenBalance, {
                    maximumFractionDigits: 18,
                  }),
                })}
                {isCurrentTokenApproved && (
                  <span
                    className="caption-small text-primary ml-1 cursor-pointer text-uppercase"
                    onClick={() =>
                      setIssueAmount({
                        formattedValue: tokenBalance.toString(),
                      })
                    }
                  >
                    {t("create-bounty:fields.amount.max")}
                  </span>
                )}
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
            disabled={true}
            value={handleTokenToEurConversion(Number(issueAmount.value),
                                              coinInfo?.prices["eur"])}
            placeholder="-"
            helperText={
              <>
                {!coinInfo && (
                  <p className="p-small text-danger">
                    Could not convert this token
                  </p>
                )}
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
