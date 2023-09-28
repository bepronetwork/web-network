import {useState} from "react";

import {useDebounce} from "use-debounce";
import {isAddress} from "web3-utils";

import useAddAllowListEntry from "../../../../../x-hooks/api/network/management/allow-list/use-add-allow-list-entry";
import useDeleteAllowListEntry
  from "../../../../../x-hooks/api/network/management/allow-list/use-delete-allow-list-entry";
import useGetAllowList from "../../../../../x-hooks/api/network/management/allow-list/use-get-allow-list";
import useReactQuery from "../../../../../x-hooks/use-react-query";
import AllowListView from "./allow-list-view";

type AllowListProps = {networkId: number};

export default function AllowList({networkId}: AllowListProps) {
  const {data: allowListOfNetwork, isFetching, isLoading, invalidate} =
    useReactQuery<string[]>(['allow-list', networkId], () => useGetAllowList(networkId));
  const [address, setAddress] = useState("");
  const [dAddress] = useDebounce(address, 300);

  function inputError() {
    return !isAddress(address) ? "not-address" : allowListOfNetwork.includes(address) ? "already-exists" : "";
  }

  async function onTrashClick(address: string) {
    try {
      await useDeleteAllowListEntry(networkId, address);
      await invalidate();
    } catch (e) {
      console.warn(`Failed to remove allow-list entry`, e);
    }
  }

  async function onAddClick() {
    if (inputError())
      return;
    try {
      await useAddAllowListEntry(networkId, dAddress);
      await invalidate();
      setAddress("");
    } catch (e) {
      console.warn(`Failed to add allow list entry`, e);
    }
  }

  return <AllowListView error={inputError()}
                        allowList={allowListOfNetwork}
                        isLoading={isLoading || isFetching}
                        value={address}
                        onValueChange={setAddress}
                        onAddClick={onAddClick}
                        onTrashClick={onTrashClick} />
}