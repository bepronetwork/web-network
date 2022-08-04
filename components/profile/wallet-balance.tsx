import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import BeProBlue from "assets/icons/bepro-blue";
import OracleIcon from "assets/icons/oracle-icon";
import TokenIconPlaceholder from "assets/icons/token-icon-placeholder";

import InfoTooltip from "components/info-tooltip";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { BEPRO_TOKEN, TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

import TokenBalance, { TokenBalanceType } from "./token-balance";

export const FlexRow = ({ children, className = "" }) => 
  <div className={`d-flex flex-row ${className}`}>{children}</div>;
  
export const FlexColumn = ({ children, className = "" }) => 
  <div className={`d-flex flex-column ${className}`}>{children}</div>;

export default function WalletBalance() {
  const { t } = useTranslation(["common", "profile"]);

  const beproToken = {
    ...BEPRO_TOKEN,
    icon: <BeProBlue width={24} height={24} />,
    balance: 0
  };

  const [tokens, setTokens] = useState<TokenBalanceType[]>([beproToken]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();

  const oracleToken = {
    symbol: t("$oracles"),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const oraclesLocked = wallet?.balance?.oracles?.locked || 0;
  const oraclesDelegatedToMe = wallet?.balance?.oracles?.delegatedByOthers || 0;

  useEffect(() => {
    if (!DAOService || !activeNetwork?.networkToken || !wallet?.balance) return;

    Promise.all([
      DAOService.getTokenBalance(BEPRO_TOKEN.address, wallet.address),
      DAOService.getTokenBalance(activeNetwork.networkToken.address, wallet.address),
      getCoinInfoByContract(BEPRO_TOKEN.address).catch(console.log),
      getCoinInfoByContract(activeNetwork.networkToken.address).catch(console.log)
    ])
    .then(([beproBalance, settlerBalance, beproInfo, settlerInfo]) => {
      const tmpTokens: TokenBalanceType[] = [{ 
        ...beproToken, 
        ...beproInfo,
        balance: beproBalance 
      }];

      const settler = { 
        ...activeNetwork.networkToken, 
        ...settlerInfo, 
        balance: settlerBalance,
        icon: (settlerInfo as TokenInfo)?.icon || <TokenIconPlaceholder />
      };

      if (activeNetwork.networkToken.address !== BEPRO_TOKEN.address)
        tmpTokens.push(settler);

      setTokens(tmpTokens);
    });

  }, [DAOService, activeNetwork?.networkToken, wallet?.balance]);

  useEffect(() => {
    if (!tokens.length) return;

    const totalConverted = tokens.reduce((acc, token) => acc + (token.balance * (token.prices?.eur || 0)), 0);
    const totalTokens = tokens.reduce((acc,token) => acc + token.balance, 0)
    const noConverted = !!tokens.find(token => token.prices?.eur === undefined);

    setTotalAmount(noConverted ? totalTokens : totalConverted);
    setHasNoConvertedToken(noConverted);

  }, [tokens]);

  return(
    <FlexColumn>
      <FlexRow className="justify-content-between align-items-center mb-4">
        <span className="h4 family-Regular text-white font-weight-medium">{t("profile:balance")}</span>
        
        <FlexRow className="align-items-center">
          <span className="caption-large text-white mr-2 font-weight-medium">{t("misc.total")}</span>
          <span className="caption-large text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
            {formatNumberToCurrency(totalAmount)}
            <span className="text-white-30 ml-1 mr-2">
              {!hasNoConvertedToken ? t("currencies.euro") : t("misc.token_other")}
            </span>
            <InfoTooltip 
              description="PLACEHOLDER"
              secondaryIcon
            />
          </span>
        </FlexRow>
      </FlexRow>

      {tokens.map(token => <TokenBalance {...token} type="token" />)}

      <FlexRow className="mt-3 mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-medium">{t("$oracles")}</span>

        <FlexRow className="align-items-center">
          <span className="caption-medium text-white mr-2 font-weight-medium">{t("misc.total")}</span>
          <span className="caption-large text-white font-weight-medium bg-dark-gray py-2 px-3 rounded-3">
            <span className="mr-2">{formatNumberToCurrency(oraclesLocked + oraclesDelegatedToMe)}</span>
            <InfoTooltip 
              description="PLACEHOLDER"
              secondaryIcon
            />
          </span>
        </FlexRow>
      </FlexRow>

      <TokenBalance
        icon={oracleToken.icon} 
        symbol={oracleToken.symbol}
        name={`Locked ${activeNetwork?.networkToken?.name || oracleToken.name}`}
        balance={oraclesLocked}
        type="oracle"
      />
    </FlexColumn>
  );
}