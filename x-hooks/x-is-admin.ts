import {useAppState} from "../contexts/app-state";
import getConfig from "next/config";

export default function isAdmin() {
  const {state} = useAppState();
  const {publicRuntimeConfig} = getConfig();

  return state?.currentUser?.walletAddress.toLowerCase() === publicRuntimeConfig.adminWallet.toLowerCase();
}