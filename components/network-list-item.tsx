import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";
import { useRouter } from "next/router";

import NetworkLogo from "components/network-logo";
import PullRequestLabels from "components/pull-request-labels";

import { handleNetworkAddress } from "helpers/custom-network";
import { formatNumberToNScale } from "helpers/formatNumber";

import { INetwork } from "interfaces/network";

import { BeproService } from "services/bepro-service";
import { getCoinInfoByContract } from "services/coingecko";

import useNetwork from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();
interface NetworkListItemProps {
  network: INetwork;
  redirectToHome?: boolean;
  addNetwork: (address: string, 
    totalBounties: number, 
    amountInCurrency: number, 
    totalSettlerLocked: number, 
    tokenName: string,
    tokenSymbol: string,
    isListedInCoinGecko?: boolean) => void;
}

export default function NetworkListItem({
  network,
  redirectToHome = false,
  addNetwork
}: NetworkListItemProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [totalBounties, setTotalBounties] = useState(0);
  const [openBounties, setOpenBounties] = useState(0);
  const [tokensLocked, setTokensLocked] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState(String(t("misc.token")));

  const { getURLWithNetwork } = useNetwork();

  function handleRedirect() {
    const url = redirectToHome ? "/" : "/account/my-network/settings";

    router.push(getURLWithNetwork(url, {
        network: network.name
    }));
  }

  async function loadNetworkData() {
    const [settlerTokenData, totalSettlerLocked, openBounties, totalBounties] = await Promise.all([
      BeproService.getSettlerTokenData(handleNetworkAddress(network)),
      BeproService.getTotalSettlerLocked(handleNetworkAddress(network)),
      BeproService.getOpenBounties(handleNetworkAddress(network)),
      BeproService.getBountiesCount(handleNetworkAddress(network))
    ]);

    setTotalBounties(totalBounties);
    setOpenBounties(openBounties);
    setTokensLocked(totalSettlerLocked);
    setTokenSymbol(settlerTokenData.symbol);
    
    
    const mainCurrency = publicRuntimeConfig?.currency?.main || "usd";
    
    const coinInfo = await getCoinInfoByContract(settlerTokenData.address).catch(() => ({ prices: {} }));
    
    addNetwork?.(handleNetworkAddress(network), 
                 totalBounties, 
                 (coinInfo.prices[mainCurrency] || 0) * totalSettlerLocked,
                 totalSettlerLocked,
                 settlerTokenData.name,
                 settlerTokenData.symbol,
                 !!coinInfo.prices[mainCurrency]);
  }

  useEffect(() => {
    loadNetworkData();
  }, []);

  return (
    <div className="list-item p-20 d-flex flex-row" onClick={handleRedirect}>
      <div className="col-3">
        <div className="d-flex flex-row align-items-center gap-20">
          <NetworkLogo
            src={`${publicRuntimeConfig?.ipfsUrl}/${network?.logoIcon}`}
            alt={`${network?.name} logo`}
            isBepro={network?.name === publicRuntimeConfig?.networkConfig?.networkName}
          />

          <span className="caption-medium text-white">{network?.name}</span>

          {(network?.isClosed && <PullRequestLabels label="closed" />) || ""}
        </div>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {formatNumberToNScale(totalBounties)}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {formatNumberToNScale(openBounties)}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center gap-20">
        <span className="caption-medium text-white ml-3">
          {formatNumberToNScale(tokensLocked)}
        </span>

        <span
          className={`caption-medium mr-2 ${
            network?.name === publicRuntimeConfig?.networkConfig?.networkName ? "text-blue" : ""
          }`}
          style={{ color: `${network?.colors?.primary}` }}
        >
          ${tokenSymbol}
        </span>
      </div>
    </div>
  );
}
