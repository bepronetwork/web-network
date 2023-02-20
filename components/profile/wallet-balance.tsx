import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import OracleIcon from "assets/icons/oracle-icon";

import InfoTooltip from "components/info-tooltip";
import TokenBalance, {TokenBalanceType} from "components/profile/token-balance";
import TokenIcon from "components/token-icon";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

import { Token } from "interfaces/token";

import {getCoinInfoByContract} from "services/coingecko";

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

  const getAddress = (token: string | Token) => typeof token === "string" ? token : token?.address;

  async function processToken(token: string | Token) {
    const [tokenData, balance] = await Promise.all([
      typeof token === "string" ? state.Service.active.getERC20TokenData(token) : token,
      state.Service.active.getTokenBalance(getAddress(token), state.currentUser.walletAddress)
    ]);
    
    const tokenInformation = await getCoinInfoByContract(tokenData.symbol);

    return {
      balance,
      ...tokenData,
      icon: <TokenIcon src={tokenInformation?.icon as string} />
    };
  }

  function loadBalances() {
    const networkToken = state.Service?.network?.active?.networkToken;
    const registryTokenAddress = state.Service?.active?.registry?.token?.contractAddress?.toLowerCase();

    console.log("###", {
      wallet: state.currentUser?.walletAddress,
      registryTokenAddress,
      networkTokenAddress: networkToken?.address,
      switchingChain: state.spinners?.switchingChain,
      starting: state.Service?.starting
    })

    if (!state.currentUser?.walletAddress || 
        !registryTokenAddress || 
        !networkToken?.address || 
        state.spinners?.switchingChain ||
        state.Service?.starting)
      return;

    const isSameToken = registryTokenAddress === networkToken.address;

    Promise.all([
      processToken(registryTokenAddress),
      isSameToken ? Promise.resolve(null) : processToken(networkToken.address)
    ]).then(tokens => {
      setOracleToken({
        symbol: t("$oracles",  { token: networkToken?.symbol }),
        name: networkToken?.name,
        icon: <OracleIcon />
      })

      setTokens(tokens.filter(v => !!v));
    });
  }

  useEffect(loadBalances, [
    state.currentUser?.walletAddress, 
    state.Service?.active?.registry?.token?.contractAddress,
    state.Service?.active?.network?.contractAddress
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