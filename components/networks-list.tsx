import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import CustomContainer from "components/custom-container";
import InternalLink from "components/internal-link";
import NetworkListBar from "components/network-list-bar";
import NetworkListItem from "components/network-list-item";
import NothingFound from "components/nothing-found";

import { ApplicationContext } from "contexts/application";
import { useDAO } from "contexts/dao";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { useSettings } from "contexts/settings";

import { orderByProperty } from "helpers/array";

import { Network } from "interfaces/network";

import { getCoinInfoByContract } from "services/coingecko";
import DAO from "services/dao-service";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";
interface NetworksListProps {
  name?: string;
  networkAddress?: string;
  creatorAddress?: string;
  redirectToHome?: boolean;
  addNetwork?: (address: string, 
              totalBounties: number, 
              amountInCurrency: number, 
              totalSettlerLocked: number, 
              tokenName: string,
              tokenSymbol: string,
              isListedInCoinGecko?: boolean) => void;
}

export default function NetworksList({
  name,
  networkAddress,
  creatorAddress,
  redirectToHome = false,
  addNetwork
}: NetworksListProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "custom-network"]);

  const [order, setOrder] = useState(["name", "asc"]);
  const [networks, setNetworks] = useState<Network[]>([]);
  
  const { network } = useNetwork();
  const { settings } = useSettings();
  const { searchNetworks } = useApi();
  const { service: DAOService } = useDAO();
  const { getURLWithNetwork } = useNetwork();

  const { dispatch } = useContext(ApplicationContext);

  function handleOrderChange(newOrder) {
    setNetworks(orderByProperty(networks, newOrder[0], newOrder[1]));
    setOrder(newOrder);
  }

  function handleRedirect() {
    const url = redirectToHome ? "/" : "/account/my-network/settings";

    router.push(getURLWithNetwork(url, {
        network: network.name
    }));
  }

  useEffect(() => {
    if (!DAOService) return;
    
    dispatch(changeLoadState(true));

    searchNetworks({
      name,
      networkAddress,
      creatorAddress,
      sortBy: "name",
      order: "asc"
    })
      .then(async ({ count, rows }) => {
        if (count > 0) {
          Promise.all(rows?.map(async (network: Network) => {
            const networkAddress = network?.networkAddress;
            const dao = new DAO({
              web3Connection: DAOService.web3Connection,
              skipWindowAssignment: true
            });

            await dao.loadNetwork(networkAddress);
            
            const [settlerTokenData, totalSettlerLocked, openBounties, totalBounties] = await Promise.all([
              dao.getSettlerTokenData().catch(() => undefined),
              dao.getTotalSettlerLocked().catch(() => 0),
              dao.getOpenBounties().catch(() => 0),
              dao.getTotalBounties().catch(() => 0)
            ]);

            const mainCurrency = settings?.currency?.defaultFiat || "eur";
      
            const coinInfo = await getCoinInfoByContract(settlerTokenData?.address).catch(() => ({ prices: {} }));
      
            addNetwork?.(networkAddress, 
                         totalBounties, 
                         (coinInfo.prices[mainCurrency] || 0) * totalSettlerLocked,
                         totalSettlerLocked,
                         settlerTokenData?.name,
                         settlerTokenData?.symbol,
                         !!coinInfo.prices[mainCurrency]);


            return { ...network, 
                     openBounties, 
                     totalBounties, 
                     networkToken: settlerTokenData, 
                     tokensLocked: totalSettlerLocked 
            }
          }))
          .then(network => setNetworks(network))
          .catch(error => console.log("Failed to load network data", error, network))
        }
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }, [creatorAddress, DAOService]);

  return (
    <CustomContainer>
      {(!networks.length && (
        <NothingFound description={t("custom-network:errors.not-found")}>
          {network ? (
            <InternalLink
              href="/new-network"
              label={String(t("actions.create-one"))}
              uppercase
              blank={network.name !== settings?.defaultNetworkConfig?.name}
            />
          ) : (
            ""
          )}
        </NothingFound>
      )) || (
        <>
          <NetworkListBar order={order} setOrder={handleOrderChange} />

          {networks.map((networkItem) => (
            <NetworkListItem
              key={`network-list-item-${networkItem.name}`}
              network={networkItem}
              handleRedirect={handleRedirect}
              tokenSymbolDefault={t("misc.token")}
            />
          ))}
        </>
      )}
    </CustomContainer>
  );
}
