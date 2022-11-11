import {createContext, useEffect} from "react";
import {useDao} from "../x-hooks/use-dao";
import {useAppState} from "./app-state";
import {useRepos} from "../x-hooks/use-repos";
import {useAuthentication} from "../x-hooks/use-authentication";
import {useSession} from "next-auth/react";
import {useNetwork} from "../x-hooks/use-network";
import {useRouter} from "next/router";
import {useSettings} from "../x-hooks/use-settings";


const _context = {};

export const GlobalEffectsContext = createContext(_context);
export const GlobalEffectsProvider = ({children}) => {

  const {state} = useAppState();
  const {query} = useRouter();
  const session = useSession();

  const dao = useDao();
  const repos = useRepos();
  const auth = useAuthentication();
  const network = useNetwork();
  const settings = useSettings();

  useEffect(dao.start, [state.Settings])

  useEffect(repos.loadRepos, [state?.Service?.network?.lastVisited]);

  useEffect(auth.validateGhAndWallet, [(session?.data?.user as any)?.login, state.currentUser?.walletAddress]);
  useEffect(auth.updateWalletAddress, [state.currentUser]);
  useEffect(auth.listenToAccountsChanged, [state.Service]);
  useEffect(auth.updateWalletBalance, [state.currentUser?.walletAddress]);
  useEffect(auth.updateCurrentUserLogin, [session?.data?.user]);
  useEffect(network.updateActiveNetwork, [query?.network, state.Settings, state.Service]);
  useEffect(network.loadNetworkToken, [state?.Service?.active?.network]);
  useEffect(network.loadNetworkTimes, [state.Service?.active?.network]);
  useEffect(network.loadNetworkAmounts, [state.Service?.active?.network]);
  useEffect(network.loadNetworkAllowedTokens, [state.Service?.active, state?.Service?.network?.active]);

  useEffect(settings.loadSettings, []);

  return <GlobalEffectsContext.Provider value={_context} children={children} />
}