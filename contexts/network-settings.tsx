import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { DefaultNetworkSettings } from "helpers/custom-network";

import { Icon, NetworkSettings, Theme } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useOctokitGraph from "x-hooks/use-octokit-graph";

const NetworkSettingsContext = createContext<NetworkSettings | undefined>(undefined);

const ALLOWED_PATHS = ["/new-network", "/[network]/account/my-network/settings"];

export const NetworkSettingsProvider = ({ children }) => {
  const router = useRouter();
  
  const [isSettingsValidated, setIsSettingsValidated] = useState(DefaultNetworkSettings.isSettingsValidated);
  const [tokensLocked, setTokensLocked] = useState(DefaultNetworkSettings.tokensLocked);
  const [details, setDetails] = useState(DefaultNetworkSettings.details);
  const [github, setGithub] = useState(DefaultNetworkSettings.github);
  const [tokens, setTokens] = useState(DefaultNetworkSettings.tokens);
  
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokitGraph();
  const { getNetwork, searchRepositories, repositoryHasIssues } = useApi();

  const isCreating = useMemo(() => router.pathname === "/new-network", [router.pathname]);
  const needsToLoad = useMemo(() => ALLOWED_PATHS.includes(router.pathname), [router.pathname]);

  const FieldsValidators = {
    amount: (locked: number, needed: number) => needed > 0 && locked >= needed,
    name: async (value: string): Promise<boolean | undefined> => {
      let validated = undefined;

      if (value.trim() !== "")
        validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork(value).catch(() => false));

      return validated;
    },
    description: (value: string) => value.trim() !== "",
    logo: (value: Icon) => value.preview !== "" && value?.raw?.type?.includes("image/svg"),
    colors: (value: Theme) => !value?.similar?.length
  };

  // Getting external data
  useEffect(() => {
    if (!wallet?.address || !user?.login || !DAOService || (!activeNetwork && !isCreating) || !needsToLoad) return;

    getUserRepositories(user.login)
      .then(async (githubRepositories) => {
        const repositories = [];
        const filtered = githubRepositories
          .filter(repo => (!repo.isFork && (user.login === repo.nameWithOwner.split("/")[0])) || repo.isOrganization)
          .map(repo => ({
            checked: false,
            isSaved: false,
            hasIssues: false,
            name: repo.name,
            fullName: repo.nameWithOwner
          }));
        
        if (isCreating) repositories.push(...filtered);
        else {
          let { rows: networkRepositories } = await searchRepositories({ networkName: activeNetwork.name });

          networkRepositories = await Promise.all(networkRepositories.map( async (repo) => ({
            checked: true,
            isSaved: true,
            name: repo.githubPath.split("/")[1],
            fullName: repo.githubPath,
            hasIssues: await repositoryHasIssues(repo.githubPath)
          })));

          repositories.push(...networkRepositories);
          
          repositories.push(...filtered.filter(repo =>
            !repositories.find((repoB) => repoB.fullName === repo.fullName)));
        }

        setGithub(previous => ({
          ...previous,
          repositories
        }));
      });

    Promise.all([
      DAOService.getTokensLockedInRegistryByAddress(wallet.address),
      DAOService.getRegistryCreatorAmount()
    ])
      .then(([
        tokensLockedInRegistry,
        registryCreatorAmount
      ]) => {
        setTokensLocked(previous => ({
          ...previous,
          amount: 0,
          locked: tokensLockedInRegistry,
          needed: registryCreatorAmount
        }));
      });
  }, [wallet?.address, user?.login, DAOService, activeNetwork, isCreating, needsToLoad]);

  // General validation
  useEffect(() => {
    setIsSettingsValidated([
      tokensLocked?.validated,
      details?.validated,
      github?.validated,
      tokens?.validated
    ].every( condition => !!condition ));
  }, [tokensLocked?.validated, details?.validated, github?.validated, tokens?.validated]);

  // Tokens locked validation
  useEffect(() => {
    setTokensLocked(previous => ({
      ...previous,
      validated: FieldsValidators.amount(tokensLocked?.locked, tokensLocked?.needed)
    }));
  }, [tokensLocked?.locked, tokensLocked?.needed]);

  // Details validation
  useEffect(() => {
    FieldsValidators.name(details?.name)
    .then(nameValidated => {
      const validated = [
        nameValidated,
        FieldsValidators.logo(details?.fullLogo),
        FieldsValidators.logo(details?.logoIcon),
        FieldsValidators.description(details?.description),
        FieldsValidators.colors(details?.theme),
      ].every(condition => condition);
  
      setDetails(previous => ({
        ...previous,
        validated
      }));
    });
  }, [details?.name, details?.description, details?.logoIcon, details?.fullLogo, details?.theme]);

  const memorizedValue = useMemo<NetworkSettings>(() => ({
    tokensLocked,
    details,
    github,
    tokens,
    isSettingsValidated
  }), [tokensLocked, details, github, tokens, isSettingsValidated]);

  return (
    <NetworkSettingsContext.Provider value={memorizedValue}>
      {children}
    </NetworkSettingsContext.Provider>
  );
}

export const useNetworkSettings = () => {
  const context = useContext(NetworkSettingsContext);

  if (!context) {
    throw new Error("useNetworkSettings must be used within an NetworkSettingsContext");
  }

  return context;
}