import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import { FlexColumn, FlexRow } from "components/profile/wallet-balance";

import { formatStringToCurrency } from "helpers/formatNumber";

import { DelegationExtended } from "interfaces/oracles-state";
import { TokenInfo } from "interfaces/token";

export type TokenBalanceType = Partial<TokenInfo>;

interface TokenBalanceProps {
  type?: "token" | "oracle" | "delegation";
  delegation?: DelegationExtended;
  overSymbol?: string;
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
} : TokenBalanceType & TokenBalanceProps) {
  const { t } = useTranslation(["common"]);

  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-transparent bg-gray-900",
    "border border-gray-800 border-radius-4 mb-2 py-3 px-4"
  ];

  const symbolColor = {
    token: "primary",
    oracle: "purple",
    delegation: "purple"
  };

  const delegationSymbol =  delegation &&
    <>{formatStringToCurrency(BigNumber(balance).toFixed())}<span className="ml-1 text-purple">{symbol}</span></>;

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")}>
      <FlexRow className="align-items-center">
        <FlexColumn className="mr-2">
          {icon}
        </FlexColumn>

        <FlexColumn>
          <span className="caption text-white font-weight-500">
            {overSymbol ? overSymbol : (delegationSymbol || symbol)}
          </span>
          <span className="caption text-gray-500 text-capitalize font-weight-500">{delegation?.to || name}</span>
        </FlexColumn>
      </FlexRow>

      <FlexRow>
        {type === "delegation" &&
          <ContractButton
            onClick={onTakeBackClick}
            color="gray-850"
            textClass="text-gray-200 font-weight-500 text-capitalize"
            className="border-radius-4 border border-gray-800"
          >
            {t("actions.take-back")}
          </ContractButton> ||
          <>
            <span className="caption text-white mr-1 font-weight-500">
              {formatStringToCurrency(BigNumber(balance).toFixed())}
            </span>
            <span className={`caption text-${symbolColor[type]} font-weight-500`}>{symbol}</span>
          </>
        }
      </FlexRow>
    </FlexRow>
  );
}