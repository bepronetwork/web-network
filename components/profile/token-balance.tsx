import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { FlexColumn, FlexRow } from "components/common/flex-box/view";
import ContractButton from "components/contract-button";
import ResponsiveWrapper from "components/responsive-wrapper";

import { formatStringToCurrency } from "helpers/formatNumber";

import { DelegationExtended } from "interfaces/oracles-state";
import { TokenInfo } from "interfaces/token";

export type TokenBalanceType = Partial<TokenInfo>;

interface TokenBalanceProps {
  type?: "token" | "oracle" | "delegation";
  delegation?: DelegationExtended;
  overSymbol?: string;
  tokenColor?: string;
  variant?: "network" | "multi-network";
  onTakeBackClick?: () => void;
}

export default function TokenBalance({
  icon,
  name,
  symbol,
  balance,
  type = "token",
  delegation,
  overSymbol,
  onTakeBackClick,
  tokenColor,
  variant = "network"
} : TokenBalanceType & TokenBalanceProps) {
  const { t } = useTranslation(["common"]);

  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-transparent flex-wrap",
    "border border-gray-800 border-radius-4 mb-2 py-3 px-4",
    variant === "network" ? "bg-gray-900" : "bg-gray-950"
  ];

  function getTextColorProps(classes) {
    if (tokenColor)
      return {
        style: {
          color: tokenColor
        },
        className: classes
      };

    return {
      className: `${classes} text-primary`
    };
  }

  const delegationSymbol =  delegation &&
    <>{formatStringToCurrency(BigNumber(balance).toFixed())}<span {...getTextColorProps("ml-1")}>{symbol}</span></>;

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")}>
      <FlexRow className="align-items-center">
        <FlexColumn className="mr-2">
          {icon}
        </FlexColumn>

        <FlexColumn>
          <span className="caption text-white font-weight-500">
          {overSymbol ? overSymbol : delegationSymbol || symbol}
          </span>
          <ResponsiveWrapper xs={false} sm={false} md={true} xxl={true}>
            <span className="caption text-gray-500 text-capitalize font-weight-500">
              {delegation?.to || name}
            </span>
          </ResponsiveWrapper>
        </FlexColumn>
      </FlexRow>
      <ResponsiveWrapper
        xs={true}
        md={false}
        sm={true}
        xxl={false}
        className="text-truncate"
      >
        <span className="my-3 fs-smallest text-gray-500 text-capitalize font-weight-500 text-truncate">
          {delegation?.to || name}
        </span>
      </ResponsiveWrapper>
      <FlexRow>
        {(type === "delegation" && onTakeBackClick) &&
          <ContractButton
            onClick={onTakeBackClick}
            color="gray-850"
            textClass="text-gray-200 font-weight-500 text-capitalize"
            className="border-radius-4 border border-gray-800"
          >
            {t("actions.take-back")}
          </ContractButton>
        }

        { type !== "delegation" &&
          <>
            <span className="caption text-white mr-1 font-weight-500">
              {formatStringToCurrency(BigNumber(balance).toFixed())}
            </span>
            <span {...getTextColorProps("caption font-weight-500")}>
              {symbol}
            </span>
          </>
        }
      </FlexRow>
    </FlexRow>
  );
}