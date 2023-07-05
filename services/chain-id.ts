import axios from "axios";
import getConfig from "next/config";

import {WinStorage} from "services/win-storage";

const { publicRuntimeConfig } = getConfig();

async function getChainIconsList() {
  const storage = new WinStorage('chainIconsList', 3600 * 24 * 1000);

  if (storage.value)
    return storage.value;

  try {
    const { data } = await axios.get("https://chainid.network/chain_icons.json");
    storage.value = data;

    return data;
  } catch (error) {
    console.debug("Failed to getChainIconsList", error);

    return [];
  }
}

async function getChainIcon(iconName: string) {
  const icons = await getChainIconsList();

  const found = icons.find(({ name }) => name?.toLowerCase() === iconName?.toLowerCase() );

  const ipfsUrl = publicRuntimeConfig?.urls?.ipfs;

  if (found && found.icons.length) {
    const urlWithoutProtocol = found.icons[0].url.replace("ipfs://", "");

    return new URL(`/ipfs/${urlWithoutProtocol}`, ipfsUrl).href;
  }

  return undefined;
}

export {
  getChainIconsList,
  getChainIcon
};