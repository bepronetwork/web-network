import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import InputNumber from "components/input-number";

import { DistributionsProps } from "interfaces/proposal";
import { Token } from "interfaces/token";

import RenderItemRow from "../create-bounty/token-amount/item-row/view";


interface AmountTokenInformationProps {
  isFunding: boolean;
  currentToken: Token;
  rewardAmount: NumberFormatValues;
  issueAmount: NumberFormatValues;
  tokenBalance: BigNumber;
  decimals: number;
  inputError: string;
  distributions: DistributionsProps;
  onIssueAmountValueChange: (
    values: NumberFormatValues,
    type: "reward" | "total"
  ) => void;
  updateShowFeesModal?: () => void;
  classNameInputs?: string;
}

export default function AmountTokenInformation({
  isFunding,
  currentToken,
  rewardAmount,
  issueAmount,
  tokenBalance,
  decimals,
  distributions,
  inputError,
  classNameInputs,
  onIssueAmountValueChange,
  updateShowFeesModal,

}: AmountTokenInformationProps) {
  const { t } = useTranslation(["bounty"]);

  return (
    <>
      <RenderItemRow
        label={
          isFunding
            ? t("bounty:fields.select-token.reward")
            : t("bounty:fields.select-token.bounty")
        }
        description={
          isFunding
            ? t("bounty:set-funded-reward-description")
            : t("bounty:set-reward-description")
        }
        classNameChildren={classNameInputs}
      >
        <InputNumber
          symbol={currentToken?.symbol}
          classSymbol=""
          thousandSeparator
          value={rewardAmount?.value}
          placeholder="0"
          max={tokenBalance?.toFixed()}
          allowNegative={false}
          decimalScale={decimals}
          onValueChange={(e) =>
            e.value !== rewardAmount.value &&
            onIssueAmountValueChange(e, "reward")
          }
        />
      </RenderItemRow>
      <RenderItemRow
        label={t("bounty:service-fee.title")}
        description={t("bounty:service-fee.support-message")}
        handleLink={updateShowFeesModal}
        classNameChildren={classNameInputs}
      >
        <InputNumber
          symbol={currentToken?.symbol}
          classSymbol=""
          thousandSeparator
          value={distributions?.totalServiceFees?.toFixed()}
          disabled
        />
      </RenderItemRow>
      <RenderItemRow
        label={t("bounty:total-amount.title")}
        description={t("bounty:total-amount.description")}
        borderBottom={isFunding ? true : false}
        classNameChildren={classNameInputs}
      >
        <InputNumber
          symbol={currentToken?.symbol}
          classSymbol=""
          thousandSeparator
          value={issueAmount?.value}
          placeholder="0"
          allowNegative={false}
          max={tokenBalance?.toFixed()}
          decimalScale={decimals}
          onValueChange={(e) =>
            e.value !== issueAmount.value &&
            onIssueAmountValueChange(e, "total")
          }
          error={!!inputError}
          helperText={
            <>{inputError && <p className="p-small">{inputError}</p>}</>
          }
        />
      </RenderItemRow>
    </>
  );
}
