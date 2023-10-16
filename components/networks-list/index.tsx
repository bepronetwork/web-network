import {useState} from "react";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import InternalLink from "components/internal-link";
import NetworkListBar from "components/networks-list/network-list-bar";
import NetworkListItem from "components/networks-list/network-list-item";
import NothingFound from "components/nothing-found";

import {useAppState} from "contexts/app-state";

import {orderByProperty} from "helpers/array";

import {Network} from "interfaces/network";

import {useNetwork} from "x-hooks/use-network";

interface NetworkListProps {
  networks: Network[];
}

export default function NetworksList({
  networks
}: NetworkListProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "custom-network"]);

  const [order, setOrder] = useState(["name", "asc"]);

  const { getURLWithNetwork } = useNetwork();

  const { state } = useAppState();

  function handleOrderChange(newOrder) {
    setOrder(newOrder);
  }

  function handleRedirect(networkName, chainName) {
    router.push(getURLWithNetwork("/", {
        network: networkName,
        chain: chainName
    }));
  }

  return (
    <div className="container-xl px-4 px-xl-0">
      <div className="row justify-content-center">
        <div className="col-xs-12 col-xl-10">
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
          <div className="d-flex flex-column gap-3">
            <NetworkListBar order={order} setOrder={handleOrderChange} />

            {orderByProperty(networks, order[0], order[1]).map((networkItem) => (
              <NetworkListItem
                key={`network-list-item-${networkItem.name}-${networkItem.chain.chainShortName}`}
                network={networkItem}
                handleRedirect={handleRedirect}
                tokenSymbolDefault={t("misc.token")}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
