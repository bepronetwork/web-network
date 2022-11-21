import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import BeProBlue from "assets/icons/bepro-blue";
import OracleIcon from "assets/icons/oracle-icon";
import TokenIconPlaceholder from "assets/icons/token-icon-placeholder";

import InfoTooltip from "components/info-tooltip";

import {formatStringToCurrency} from "helpers/formatNumber";

import {useAppState} from "../../contexts/app-state";
import TokenBalance, {TokenBalanceType} from "./token-balance";

export const FlexRow = ({children, className = ""}) =>
  <div className={`d-flex flex-row ${className}`}>{children}</div>;

export const FlexColumn = ({children, className = ""}) =>
  <div className={`d-flex flex-column ${className}`}>{children}</div>;

export default function WalletBalance() {
  const { t } = useTranslation(["common", "profile"]);
  
  const [totalAmount, setTotalAmount] = useState("0");
  const [oracleToken, setOracleToken] = useState(null);
  const [tokens, setTokens] = useState<TokenBalanceType[]>([]);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const { state } = useAppState();

  const oraclesLocked = state.currentUser?.balance?.oracles?.locked || BigNumber(0);
  const oraclesDelegatedToMe = state.currentUser?.balance?.oracles?.delegatedByOthers || BigNumber(0);

  function loadBalances() {
    const networkTokenAddress = state.Service?.network?.networkToken?.address;

    if (!state.currentUser?.walletAddress || !state.Service?.active || !networkTokenAddress)
      return;

    const { networkToken } = state.Service?.network || {};

    console.log({networkToken})

    state.Service.active.loadRegistry()
      .then(registry => {
        if (!registry) return;

        const registryTokenAddress = registry.token.contractAddress;

        Promise.all([
          state.Service.active.getTokenBalance(registryTokenAddress, state.currentUser.walletAddress)
            .then(async (balance) => {
              return {
                balance,
                ... (await state.Service.active.getERC20TokenData(registryTokenAddress)),
                icon: <BeProBlue width={24} height={24} />
              }
            }),
          registryTokenAddress === state.Service?.network?.networkToken?.address ? Promise.resolve(null) :
          state.Service.active
            .getTokenBalance(state.Service?.network?.networkToken?.address, state.currentUser.walletAddress)
            .then(balance => ({ ...networkToken, balance, icon: <TokenIconPlaceholder />}))
        ]).then(tokens => {
          setOracleToken({
            symbol: t("$oracles",  { token: networkToken?.symbol }),
            name: networkToken?.name,
            icon: <OracleIcon />
          })
    
          setTokens(tokens.filter(v => !!v));
        });
      });
  }

  useEffect(loadBalances, [
    state.currentUser?.walletAddress, 
    state.Service?.active, 
    state.Service?.network?.networkToken?.address
  ]);

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
          {oracleToken?.symbol}
        </span>

        <FlexRow className="align-items-center">
          <span className="caption-medium text-white mr-2 font-weight-medium">{t("misc.total")}</span>
          <span className="caption-large text-white font-weight-medium bg-dark-gray py-2 px-3 rounded-3">
            <span className="mr-2">{formatStringToCurrency(oraclesLocked?.plus(oraclesDelegatedToMe)?.toFixed())}</span>
            <InfoTooltip 
              description={t("profile:tips.total-oracles", {
                tokenName: oracleToken?.name
              })}
              secondaryIcon
            />
          </span>
        </FlexRow>
      </FlexRow>

      <TokenBalance
        icon={oracleToken?.icon}
        symbol={oracleToken?.symbol}
        name={`${t("misc.locked")} ${tokens[1]?.name || oracleToken?.name || t("misc.token")}`}
        balance={oraclesLocked}
        type="oracle"
      />
    </FlexColumn>
  );
}