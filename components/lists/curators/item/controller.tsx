import CuratorListItemView from "components/lists/curators/item/view";

import { useAppState } from "contexts/app-state";

import { Curator } from "interfaces/curators";

import { useNetwork } from "x-hooks/use-network";

interface CuratorListItemProps {
  curator: Curator;
}

export default function CuratorListItem({
  curator
}: CuratorListItemProps) {
  const { state } = useAppState();
  const { goToProfilePage } = useNetwork();

  const isConnected = !!state.currentUser?.walletAddress;
  const isSameAddress = state.currentUser?.walletAddress?.toLowerCase() === curator?.address?.toLowerCase();

  function onDelegateClick() {
    goToProfilePage("voting-power", {
      curatorAddress: curator?.address,
    });
  }
  
  return(
    <CuratorListItemView
      curator={curator}
      onDelegateClick={(isConnected && !isSameAddress ) ? onDelegateClick : undefined}
    />
  );
}