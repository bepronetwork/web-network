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

import { NetworksPageContext } from "pages/networks";

import { getCoinInfoByContract } from "services/coingecko";
import DAO from "services/dao-service";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";


export default function NetworksList() {
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
  const { 
    setNumberOfNetworks, 
    setNumberOfBounties, 
    setTotalConverted, 
    setNotConvertedTokens 
  } = useContext(NetworksPageContext);

  function handleOrderChange(newOrder) {
    setOrder(newOrder);
  }

  function handleRedirect(networkName) {
    router.push(getURLWithNetwork("/", {
        network: networkName
    }));
  }

  useEffect(() => {    
    dispatch(changeLoadState(true));

    searchNetworks({
      isRegistered: true,
      sortBy: "name",
      order: "asc"
    })
      .then(async ({ count, rows }) => {
        if (count > 0) {
          setNumberOfNetworks(count);

          setNetworks(rows);
        }
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }, []);

  useEffect(() => {
    if (!networks.length) return;

    setNumberOfBounties(networks.reduce((acc, el) => acc + (el?.totalBounties || 0), 0));
    setTotalConverted(networks.reduce((acc, el) => acc + (el?.totalSettlerConverted || 0), 0));

    const networkWithNotConvertedToken = 
      networks.filter(network => network?.tokensLocked > 0 && network?.totalSettlerConverted === 0);

    const notConvertedEntries = 
      networkWithNotConvertedToken.map(({ tokensLocked, networkToken }) => [networkToken.address, {
        name: networkToken.name,
        symbol: networkToken.symbol,
        totalSettlerLocked: tokensLocked
      }]);

    setNotConvertedTokens(Object.fromEntries(notConvertedEntries));

    if (!DAOService || networks?.every(network => network?.openBounties !== undefined)) return;

    Promise.all(networks.map(async (network: Network) => {
      const networkAddress = network?.networkAddress;
      const dao = new DAO({
        web3Connection: DAOService.web3Connection,
        skipWindowAssignment: true
      });

      await dao.loadNetwork(networkAddress);
      
      const [settlerTokenData, totalSettlerLocked, openBounties, totalBounties] = await Promise.all([
        dao.getSettlerTokenData().catch(() => undefined),
        dao.getTotalNetworkToken().catch(() => 0),
        dao.getOpenBounties().catch(() => 0),
        dao.getTotalBounties().catch(() => 0)
      ]);

      const mainCurrency = settings?.currency?.defaultFiat || "eur";

      const coinInfo = await getCoinInfoByContract(settlerTokenData?.address).catch(() => ({ prices: {} }));

      const totalSettlerConverted = (coinInfo.prices[mainCurrency] || 0) * totalSettlerLocked;

      return { ...network, 
               openBounties, 
               totalBounties, 
               networkToken: settlerTokenData, 
               tokensLocked: totalSettlerLocked,
               totalSettlerConverted
      }
    }))
      .then(setNetworks)
      .catch(error => console.log("Failed to load network data", error, network));
  }, [networks, DAOService]);

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

          {orderByProperty(networks, order[0], order[1]).map((networkItem) => (
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
