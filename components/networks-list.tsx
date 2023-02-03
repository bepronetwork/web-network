import {useContext, useEffect, useState} from "react";

import BigNumber from "bignumber.js";
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
import { OPEN_STATES } from "helpers/issue";

import {Network} from "interfaces/network";

import {NetworksPageContext} from "pages/networks";

import {getCoinPrice} from "services/coingecko";

import useApi from "x-hooks/use-api";
import {useNetwork} from "x-hooks/use-network";

export default function NetworksList() {
  const router = useRouter();
  const { t } = useTranslation(["common", "custom-network"]);

  const [order, setOrder] = useState(["name", "asc"]);
  const [networks, setNetworks] = useState<Network[]>([]);

  const { getURLWithNetwork } = useNetwork();
  const { searchNetworks, getHeaderNetworks } = useApi();

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

  async function processNetwork(network: Network) {
    const { issues, networkToken, curators } = network;

    const { openBounties, totalBounties } = 
      issues.reduce((acc, curr) => ({
        openBounties: acc.openBounties + (OPEN_STATES.includes(curr.state) ? 1 : 0),
        totalBounties: acc.totalBounties + (curr.state !== "pending" ? 1 : 0),
      }), { openBounties: 0, totalBounties: 0 });

    const tokensLocked = curators.reduce((acc, curr) => acc.plus(curr.tokensLocked), new BigNumber("0"));

    const coinPrice = await getCoinPrice(networkToken?.symbol).catch(() => 0);

    const totalSettlerConverted = tokensLocked.multipliedBy(coinPrice).toFixed();

    return { 
      ...network,
      openBounties,
      totalBounties,
      tokensLocked: tokensLocked.toFixed(),
      totalSettlerConverted: totalSettlerConverted
    };
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

          const processed = await Promise.all(rows.map(processNetwork));

          setNetworks(processed);

          const { totalBounties, totalSettlerConverted } =
            processed.reduce((acc, curr) => {
              const settlerConverted = new BigNumber(curr.totalSettlerConverted);
              
              return {
                totalBounties: acc.totalBounties + curr.totalBounties,
                totalSettlerConverted: acc.totalSettlerConverted.plus(settlerConverted)
              };
            }, { totalBounties: 0, totalSettlerConverted: new BigNumber("0") });

          setNumberOfBounties(totalBounties);
          setTotalConverted(totalSettlerConverted.toFixed());
        }
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }, []);

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
