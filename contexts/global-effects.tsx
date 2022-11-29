import {createContext, useEffect} from "react";

import {useSession} from "next-auth/react";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";

import {CustomSession} from "interfaces/custom-session";

import {useAuthentication} from "x-hooks/use-authentication";
import {useDao} from "x-hooks/use-dao";
import {useNetwork} from "x-hooks/use-network";
import {useRepos} from "x-hooks/use-repos";
import {useSettings} from "x-hooks/use-settings";
import { useTransactions } from "x-hooks/use-transactions";

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
  const transactions = useTransactions();

  useEffect(dao.start, [state.supportedChains, state.connectedChain]);
  useEffect(dao.changeNetwork, [state.Service?.active, state.Service?.network?.active?.networkAddress]);

  useEffect(repos.loadRepos, [state?.Service?.network?.lastVisited]);
  useEffect(repos.updateActiveRepo, [query?.repoId, state.Service?.network?.repos]);

  useEffect(auth.validateGhAndWallet,
            [(session?.data as CustomSession),
              state.currentUser?.walletAddress,
              // asPath.includes('developers'),
              // asPath.includes('bounty'),
              // asPath.includes('profile'),
            ]);
  useEffect(auth.updateWalletAddress, [state.currentUser]);
  useEffect(auth.listenToAccountsChanged, [state.Service]);
  useEffect(auth.updateWalletBalance, [state.currentUser?.walletAddress, state?.Service?.active?.network]);
  useEffect(auth.updateCurrentUserLogin, [session?.data?.user]);
  useEffect(auth.verifyReAuthorizationNeed, [state.currentUser?.walletAddress]);
  useEffect(network.updateActiveNetwork, [query?.network, state?.Service?.active?.network]);
  useEffect(network.loadNetworkToken, [state?.Service?.active?.network]);
  useEffect(network.loadNetworkTimes, [state.Service?.active?.network]);
  useEffect(network.loadNetworkAmounts, [state.Service?.active?.network]);
  useEffect(network.loadNetworkAllowedTokens, [state.Service?.active, state?.Service?.network?.active]);

  useEffect(settings.loadSettings, []);

  useEffect(transactions.loadFromStorage, [state.currentUser?.walletAddress]);
  useEffect(transactions.saveToStorage, [state.transactions]);

  return <GlobalEffectsContext.Provider value={_context} children={children} />
}