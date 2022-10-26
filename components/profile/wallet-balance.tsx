import {useContext, useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import BeProBlue from "assets/icons/bepro-blue";
import OracleIcon from "assets/icons/oracle-icon";
import TokenIconPlaceholder from "assets/icons/token-icon-placeholder";

import InfoTooltip from "components/info-tooltip";

import { formatStringToCurrency } from "helpers/formatNumber";

import { TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

import {AppStateContext, useAppState} from "../../contexts/app-state";
import TokenBalance, { TokenBalanceType } from "./token-balance";

export const FlexRow = ({ children, className = "" }) => 
  <div className={`d-flex flex-row ${className}`}>{children}</div>;
  
export const FlexColumn = ({ children, className = "" }) => 
  <div className={`d-flex flex-column ${className}`}>{children}</div>;

export default function WalletBalance() {
  const { t } = useTranslation(["common", "profile"]);
  
  const [tokens, setTokens] = useState<TokenBalanceType[]>([]);
  const [totalAmount, setTotalAmount] = useState("0");
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const {state} = useAppState();

  const oracleToken = {
    symbol: t("$oracles",  { token: state.Service?.network?.active?.networkToken?.symbol }),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const oraclesLocked = state.currentUser?.balance?.oracles?.locked || BigNumber(0);
  const oraclesDelegatedToMe = state.currentUser?.balance?.oracles?.delegatedByOthers || BigNumber(0);

  useEffect(() => {
    let beproToken = undefined;

    if (state.Settings?.beproToken) {
      beproToken = {
        ...state.Settings.beproToken,
        icon: <BeProBlue width={24} height={24} />,
        balance: "0"
      };
  
      setTokens([beproToken]);
    }

    if (!state.Service?.active || !state.Service?.network?.active?.networkToken || !state.currentUser?.balance || !state.Settings?.beproToken) return;

    Promise.all([
      state.Service?.active.getTokenBalance(beproToken.address, state.currentUser.walletAddress),
      state.Service?.active.getTokenBalance(state.Service?.network?.active.networkToken.address, state.currentUser.walletAddress),
      getCoinInfoByContract(beproToken.address).catch(console.log),
      getCoinInfoByContract(state.Service?.network?.active.networkToken.address).catch(console.log)
    ])
    .then(([beproBalance, settlerBalance, beproInfo, settlerInfo]) => {
      const tmpTokens: TokenBalanceType[] = [{ 
        ...beproToken, 
        ...beproInfo,
        balance: beproBalance 
      }];

      const settler = { 
        ...state.Service?.network?.active.networkToken,
        ...settlerInfo, 
        balance: settlerBalance,
        icon: (settlerInfo as TokenInfo)?.icon || <TokenIconPlaceholder />
      };

      if (state.Service?.network?.active.networkToken.address !== beproToken.address)
        tmpTokens.push(settler);

      setTokens(tmpTokens);
    });

  }, [state.Service?.active, state.Service?.network?.active?.networkToken, state.currentUser?.balance, state.Settings]);

  useEffect(() => {
    if (!tokens.length) return;

    const totalConverted = tokens.reduce((acc, token) => BigNumber(token.balance)
                                                          .multipliedBy(token.prices?.eur || 0)
                                                          .plus(acc), BigNumber(0));
    const totalTokens = tokens.reduce((acc, token) => BigNumber(token.balance).plus(acc), BigNumber(0));
    const noConverted = !!tokens.find(token => token.prices?.eur === undefined);

    setTotalAmount(noConverted ? totalTokens.toFixed() : totalConverted.toFixed());
    setHasNoConvertedToken(noConverted);

  }, [tokens]);

  return(
    <FlexColumn>
      <FlexRow className="justify-content-between align-items-center mb-4">
        <span className="h4 family-Regular text-white font-weight-medium">{t("profile:balance")}</span>
        
        <FlexRow className="align-items-center">
          <span className="caption-large text-white mr-2 font-weight-medium">{t("misc.total")}</span>
          <span className="caption-large text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
            {formatStringToCurrency(totalAmount)}
            <span className="text-white-30 ml-1 mr-2">
              {!hasNoConvertedToken ? t("currencies.euro") : t("misc.token_other")}
            </span>
            <InfoTooltip 
              description={t("profile:tips.total-balance")}
              secondaryIcon
            />
          </span>
        </FlexRow>
      </FlexRow>

      {tokens.map(token => <TokenBalance key={`balance-${token.address}`} {...token} type="token" />)}

      <FlexRow className="mt-3 mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-medium">
          {t("$oracles",  { token: state.Service?.network?.active?.networkToken?.symbol })}
        </span>

        <FlexRow className="align-items-center">
          <span className="caption-medium text-white mr-2 font-weight-medium">{t("misc.total")}</span>
          <span className="caption-large text-white font-weight-medium bg-dark-gray py-2 px-3 rounded-3">
            <span className="mr-2">{formatStringToCurrency(oraclesLocked?.plus(oraclesDelegatedToMe)?.toFixed())}</span>
            <InfoTooltip 
              description={t("profile:tips.total-oracles", {
                tokenName: state.Service?.network?.active?.networkToken?.name || oracleToken.name
              })}
              secondaryIcon
            />
          </span>
        </FlexRow>
      </FlexRow>

      <TokenBalance
        icon={oracleToken.icon} 
        symbol={oracleToken.symbol}
        name={`${t("misc.locked")} ${state.Service?.network?.active?.networkToken?.name || oracleToken.name}`}
        balance={oraclesLocked}
        type="oracle"
      />
    </FlexColumn>
  );
}