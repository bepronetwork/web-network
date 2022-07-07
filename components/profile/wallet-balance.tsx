import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import BeProBlue from "assets/icons/bepro-blue";
import OracleIcon from "assets/icons/oracle-icon";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { BEPRO_TOKEN, TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

type TokenBalance = Partial<TokenInfo>;

export default function WalletBalance() {
  const { t } = useTranslation(["common", "profile"]);

  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalEuro, setTotalEuro] = useState(0);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();

  const FlexRow = ({ children, className = "" }) => <div className={`d-flex flex-row ${className}`}>{children}</div>;
  const FlexColumn = ({ children, className = "" }) => 
    <div className={`d-flex flex-column ${className}`}>{children}</div>;

  const oracleToken = {
    symbol: t("$oracles"),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const TokenBalance = ({ icon, name, symbol, balance } : TokenBalance) => {
    const CONTAINER_CLASSES = [
      "justify-content-between align-items-center bg-transparent",
      "border border-dark-gray border-radius-8 mb-2 py-3 px-4"
    ];

    return (
      <FlexRow className={CONTAINER_CLASSES.join(" ")}>
        <FlexRow className="align-items-center">
          <FlexColumn className="mr-2">
            {icon}
          </FlexColumn>

          <FlexColumn>
            <span className="caption text-white">{symbol}</span>
            <span className="caption text-gray text-capitalize font-weight-normal">{name}</span>
          </FlexColumn>
        </FlexRow>

        <span className="caption text-white">{formatNumberToCurrency(balance)}</span>
      </FlexRow>
    );
  };

  useEffect(() => {
    if (!DAOService || !activeNetwork?.networkToken || !wallet?.balance) return;

    Promise.all([
      DAOService.getTokenBalance(BEPRO_TOKEN.address, wallet.address),
      DAOService.getTokenBalance(activeNetwork.networkToken.address, wallet.address),
      getCoinInfoByContract(BEPRO_TOKEN.address).catch(console.log),
      getCoinInfoByContract(activeNetwork.networkToken.address).catch(console.log)
    ])
    .then(([beproBalance, settlerBalance, beproInfo, settlerInfo]) => {
      const tmpTokens: TokenBalance[] = [{ 
        ...BEPRO_TOKEN, 
        ...beproInfo, 
        icon: <BeProBlue width={24} height={24} />, balance: beproBalance 
      }];

      const settler = { ...activeNetwork.networkToken, ...settlerInfo, balance: settlerBalance };

      if (activeNetwork.networkToken.address !== BEPRO_TOKEN.address)
        tmpTokens.push(settler);

      tmpTokens.push({
        ...settler,
        balance: wallet.balance.oracles.locked,
        symbol: oracleToken.symbol,
        name: `${t("misc.locked")} ${settler.name}`,
        icon: oracleToken.icon
      });

      setTokens(tmpTokens);
    });

  }, [DAOService, activeNetwork?.networkToken, wallet?.balance]);

  useEffect(() => {
    if (!tokens.length) return;

    const totalConverted = tokens.reduce((acc, token) => acc + (token.balance * (token.prices?.eur || 0)), 0);
    const noConverted = !!tokens.find(token => token.prices?.eur === undefined);

    setTotalEuro(totalConverted);
    setHasNoConvertedToken(noConverted);

  }, [tokens]);

  return(
    <FlexColumn>
      <FlexRow className="justify-content-between align-items-center mb-4">
        <span className="family-Regular h4 text-white">{t("profile:balance")}</span>
        
        <FlexRow className="align-items-center">
          <span className="caption-medium text-white mr-2">{t("misc.total")}</span>
          <span className="h4 family-Regular text-white bg-dark-gray py-2 px-3 border-radius-8">
            {`${hasNoConvertedToken && "~" || ""} ${formatNumberToCurrency(totalEuro)} ${t("currencies.euro")}`}
          </span>
        </FlexRow>
      </FlexRow>

      {tokens.map(TokenBalance)}

      <FlexRow className="mt-3 mb-3">
        <span className="family-Regular h4 text-white">{t("profile:oracles-deletaged-to-me")}</span>
      </FlexRow>
      
      <TokenBalance 
        icon={oracleToken.icon} 
        symbol={oracleToken.symbol}
        name={`Locked ${activeNetwork?.networkToken?.name || oracleToken.name}`}
        balance={wallet?.balance?.oracles?.delegatedByOthers || 0}
      />
    </FlexColumn>
  );
}