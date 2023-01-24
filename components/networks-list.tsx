import {useContext, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CustomContainer from "components/custom-container";
import InternalLink from "components/internal-link";
import NetworkListBar from "components/network-list-bar";
import NetworkListItem from "components/network-list-item";
import NothingFound from "components/nothing-found";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";

import {orderByProperty} from "helpers/array";

import {Network} from "interfaces/network";

import {NetworksPageContext} from "pages/networks";

import DAO from "services/dao-service";

import useApi from "x-hooks/use-api";
import {useNetwork} from "x-hooks/use-network";

export default function NetworksList() {
  const router = useRouter();
  const { t } = useTranslation(["common", "custom-network"]);

  const [order, setOrder] = useState(["name", "asc"]);
  const [networks, setNetworks] = useState<Network[]>([]);

  const { searchNetworks, getHeaderNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();

  const { state, dispatch } = useAppState();
  const { 
    setNumberOfNetworks, 
    setNumberOfBounties, 
    setTotalConverted, 
  } = useContext(NetworksPageContext);

  function handleOrderChange(newOrder) {
    setOrder(newOrder);
  }

  function handleRedirect(networkName, chainName) {
    router.push(getURLWithNetwork("/", {
        network: networkName,
        chain: chainName
    }));
  }

  useEffect(() => {    
    dispatch(changeLoadState(true));

    getHeaderNetworks().then(({ TVL, bounties, number_of_network }) => {
      setTotalConverted(TVL.toFixed() || "0")
      setNumberOfNetworks(number_of_network || 0)
      setNumberOfBounties(bounties || 0)
    })
    .catch(error => console.log("Failed to retrieve header data", error))

    searchNetworks({
      isRegistered: true,
      sortBy: "name",
      order: "asc",
      isNeedCountsAndTokensLocked: true
    })
      .then(async ({ count, rows }) => {
        if (count > 0) {
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
    if (!state.Service?.active) return;
    if (!networks.length) return;
    if (networks[0]?.networkToken?.address) return;

    const web3Host = state.Settings?.urls?.web3Provider;
    const dao = new DAO({web3Host, skipWindowAssignment: true});

    dao.start()
      .then( () => Promise.all(networks.map(async (network: Network) => {
        const networkAddress = network?.networkAddress;
        await dao.loadNetwork(networkAddress);

        const settlerTokenData = await dao.getSettlerTokenData().catch(() => undefined);

        return { 
          ...network,
          networkToken: settlerTokenData
        }
      })))
      .then(setNetworks)
      .catch(error => console.log("Failed to load network data", error, state.Service?.network?.active));
  }, [networks, state.Service?.active]);

  return (
    <CustomContainer>
      {(!networks.length && (
        <NothingFound description={t("custom-network:errors.not-found")}>
          {state.Service?.network?.active ? (
            <InternalLink
              href="/new-network"
              label={String(t("actions.create-one"))}
              uppercase
              blank={state.Service?.network?.active.name !== state.Settings?.defaultNetworkConfig?.name}
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
              key={`network-list-item-${networkItem.name}-${networkItem.chain.chainShortName}`}
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
