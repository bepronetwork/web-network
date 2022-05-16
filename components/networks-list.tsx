import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import CustomContainer from "components/custom-container";
import InternalLink from "components/internal-link";
import NetworkListBar from "components/network-list-bar";
import NetworkListItem from "components/network-list-item";
import NothingFound from "components/nothing-found";

import { ApplicationContext } from "contexts/application";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { orderByProperty } from "helpers/array";

import { INetwork } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";
interface NetworksListProps {
  name?: string;
  networkAddress?: string;
  creatorAddress?: string;
  redirectToHome?: boolean;
}
const { publicRuntimeConfig } = getConfig();

export default function NetworksList({
  name,
  networkAddress,
  creatorAddress,
  redirectToHome = false,
}: NetworksListProps) {
  const { t } = useTranslation(["common", "custom-network"]);
  const [order, setOrder] = useState(["name", "asc"]);
  const [networks, setNetworks] = useState<INetwork[]>([]);

  const { searchNetworks } = useApi();
  const { network } = useNetwork();

  const { dispatch } = useContext(ApplicationContext);

  function updateNetworkParameter(networkName, parameter, value) {
    const tmpNetworks = [...networks];
    const index = tmpNetworks.findIndex((el) => el.name === networkName);

    tmpNetworks[index][parameter] = value;

    setNetworks(tmpNetworks);
  }

  function handleOrderChange(newOrder) {
    setNetworks(orderByProperty(networks, newOrder[0], newOrder[1]));
    setOrder(newOrder);
  }

  useEffect(() => {
    dispatch(changeLoadState(true));

    searchNetworks({
      name,
      networkAddress,
      creatorAddress,
      sortBy: "name",
      order: "asc"
    })
      .then(({ count, rows }) => {
        if (count > 0) setNetworks(rows);
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }, [creatorAddress]);

  return (
    <CustomContainer>
      {(!networks.length && (
        <NothingFound description={t("custom-network:errors.not-found")}>
          {network ? (
            <InternalLink
              href="/new-network"
              label={String(t("actions.create-one"))}
              uppercase
              blank={network.name !== publicRuntimeConfig?.networkConfig?.networkName}
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
              redirectToHome={redirectToHome}
              updateNetworkParameter={updateNetworkParameter}
            />
          ))}
        </>
      )}
    </CustomContainer>
  );
}
