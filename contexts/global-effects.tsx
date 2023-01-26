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
import {useTransactions} from "x-hooks/use-transactions";

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

  const { supportedChains, connectedChain, currentUser, Service, transactions: stateTransactions } = state;

  useEffect(dao.start, [
    supportedChains,
    connectedChain,
    connectedChain?.matchWithNetworkChain
  ]);

  useEffect(dao.changeNetwork, [
    Service?.active, 
    Service?.network?.active?.networkAddress, 
    connectedChain?.matchWithNetworkChain
  ]);

  useEffect(dao.changeChain, [
    connectedChain?.matchWithNetworkChain,
    currentUser?.walletAddress
  ]);

  useEffect(repos.loadRepos, [
    query?.network ,
    Service?.network?.lastVisited,
    state.Service?.network?.active
  ]);
  useEffect(repos.updateActiveRepo, [query?.repoId, Service?.network?.repos]);

  useEffect(auth.validateGhAndWallet,
            [(session?.data as CustomSession),
              currentUser?.walletAddress,
              // asPath.includes('developers'),
              // asPath.includes('bounty'),
              // asPath.includes('profile'),
            ]);
  useEffect(auth.updateWalletAddress, [currentUser]);
  useEffect(auth.listenToAccountsChanged, [Service]);
  useEffect(auth.updateWalletBalance, [currentUser?.walletAddress, Service?.active?.network]);
  useEffect(auth.signMessageIfAdmin, [currentUser?.walletAddress]);
  useEffect(auth.updateCurrentUserLogin, [session?.data?.user]);
  useEffect(auth.verifyReAuthorizationNeed, [currentUser?.walletAddress]);
  useEffect(network.updateActiveNetwork, [query?.network, query?.chain]);
  useEffect(network.loadNetworkToken, [Service?.active?.network]);
  useEffect(network.loadNetworkTimes, [Service?.active?.network]);
  useEffect(network.loadNetworkAmounts, [Service?.active?.network]);
  useEffect(network.loadNetworkAllowedTokens, [Service?.active, Service?.network?.active]);
  useEffect(network.updateNetworkAndChainMatch, [
    connectedChain?.id,
    query?.network,
    query?.chain,
    Service?.network?.active?.chain_id
  ]);

  useEffect(settings.loadSettings, []);

  useEffect(transactions.loadFromStorage, [currentUser?.walletAddress]);
  useEffect(transactions.saveToStorage, [stateTransactions]);

  return <GlobalEffectsContext.Provider value={_context} children={children} />
}