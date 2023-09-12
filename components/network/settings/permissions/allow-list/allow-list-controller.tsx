import useReactQuery from "../../../../../x-hooks/use-react-query";
import {useState} from "react";
import {useDebounce} from "use-debounce";
import {isAddress} from "web3-utils";
import AllowListView from "./allow-list-view";
import useGetAllowList from "../../../../../x-hooks/api/network/management/allow-list/use-get-allow-list";
import useDeleteAllowListEntry
  from "../../../../../x-hooks/api/network/management/allow-list/use-delete-allow-list-entry";
import useAddAllowListEntry from "../../../../../x-hooks/api/network/management/allow-list/use-add-allow-list-entry";

type AllowListProps = {networkId: number};

export default function AllowList({networkId}: AllowListProps) {
  const {data: allowListOfNetwork, invalidate} =
    useReactQuery(['allow-list', networkId], () => useGetAllowList(networkId));
  const [address, setAddress] = useState("");
  const [dAddress] = useDebounce(address, 100);

  function inputError() {
    return !isAddress(dAddress) ? "not-address" : allowListOfNetwork.includes(dAddress) ? "already-exists" : "";
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
    } catch (e) {
      console.warn(`Failed to add allow list entry`, e);
    }
  }

  return <AllowListView error={inputError()}
                        allowList={allowListOfNetwork}
                        value={dAddress}
                        onValueChange={setAddress}
                        onAddClick={onAddClick}
                        onTrashClick={onTrashClick} />
}