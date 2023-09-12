import { useRouter } from "next/router";

import ChainSelectorView from "components/navigation/chain-selector/view";

import { useAppState } from "contexts/app-state";

import { isOnNetworkPath } from "helpers/network";

import { SupportedChainData } from "interfaces/supported-chain-data";

import { useDao } from "x-hooks/use-dao";
import { useNetwork } from "x-hooks/use-network";
import useNetworkChange from "x-hooks/use-network-change";

export default function ChainSelector({
  isFilter = false
}: {
  isFilter?: boolean;
}) {
  const { query, pathname, asPath, push } = useRouter();

  const { connect } = useDao();
  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { handleAddNetwork } = useNetworkChange();
  
  const isOnNetwork = isOnNetworkPath(pathname);
  const isWalletPage = asPath?.includes("wallet");
  const isCreateBountyPage = pathname?.includes("create-bounty");
  const isCreateNetworkPage = pathname?.includes("new-network");
  const isCreateDeliverablePage = pathname?.includes("create-deliverable");
  const shouldMatchChain = 
    isFilter || isWalletPage || isOnNetwork || isCreateBountyPage || isCreateNetworkPage || isCreateDeliverablePage;

  async function handleNetworkSelected(chain: SupportedChainData) {
    if (!shouldMatchChain) return;

    if (!isOnNetwork) {
      handleAddNetwork(chain)
        .then(() => {
          if (state.currentUser?.walletAddress) return;

          connect();
        })
        .catch(() => null);

      return;
    }

    const needsRedirect = ["bounty", "pull-request", "proposal"].includes(pathname.replace("/[network]/[chain]/", ""));
    const newPath = needsRedirect ? "/" : pathname;
    const newAsPath = needsRedirect ? `/${query.network}/${chain.chainShortName}` :
      asPath.replace(query.chain.toString(), chain.chainShortName);

    push(getURLWithNetwork(newPath, {
      ... needsRedirect ? {} : query,
      chain: chain.chainShortName
    }), newAsPath);
  }

  return(
    <ChainSelectorView
      isFilter={isFilter}
      onSelect={handleNetworkSelected}
      shouldMatchChain={shouldMatchChain}
      isOnNetwork={isOnNetwork}
    />
  );
}