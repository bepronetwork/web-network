import { Delegation } from "@taikai/dappkit/dist/src/interfaces/delegation";
import { useTranslation } from "next-i18next";

import Button from "components/button";

import { formatStringToCurrency } from "helpers/formatNumber";

import { TokenInfo } from "interfaces/token";

import { FlexColumn, FlexRow } from "./wallet-balance";

export type TokenBalanceType = Partial<TokenInfo>;

interface TokenBalanceProps {
  type: "token" | "oracle" | "delegation";
  delegation?: Delegation;
  overSymbol?: string;
  onTakeBackClick?: () => void;
}

export default function TokenBalance({ 
  icon, 
  name, 
  symbol, 
  balance,
  type,
  delegation,
  overSymbol,
  onTakeBackClick
} : TokenBalanceType & TokenBalanceProps) {
  const { t } = useTranslation(["common"]);

  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-transparent",
    "border border-dark-gray border-radius-8 mb-2 py-3 px-4"
  ];

  const symbolColor = {
    token: "primary",
    oracle: "purple",
    delegation: "purple"
  };

  const delegationSymbol = 
    delegation && <>{formatStringToCurrency(balance.toString())}<span className="ml-1 text-purple">{symbol}</span></>;

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")}>
      <FlexRow className="align-items-center">
        <FlexColumn className="mr-2">
          {icon}
        </FlexColumn>

        <FlexColumn>
          <span className="caption text-white">{overSymbol ? overSymbol : (delegationSymbol || symbol)}</span>
          <span className="caption text-gray text-capitalize font-weight-normal">{delegation?.to || name}</span>
        </FlexColumn>
      </FlexRow>

      <FlexRow>
        {type === "delegation" && 
          <Button onClick={onTakeBackClick} color="purple" outline  textClass="text-white">
            {t("actions.take-back")}
          </Button> ||
          <>
            <span className="caption text-white mr-1">{formatStringToCurrency(balance.toString())}</span>
            <span className={`caption text-${symbolColor[type]}`}>{symbol}</span>
          </>
        }
      </FlexRow>
    </FlexRow>
  );
}