import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { Icon, NetworkSettings } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useOctokitGraph from "x-hooks/use-octokit-graph";


const NetworkSettingsContext = createContext<NetworkSettings | undefined>(undefined);

interface ProviderProps {
  isCreating?: boolean;
  children: ReactNode | ReactNode[];
}

export const NetworkSettingsProvider = ({ isCreating, children } : ProviderProps) => {
  const { getNetwork } = useApi();

  const FieldsValidators = {
    name: async (value: string) => {
      let validated = undefined;

      if (value.trim() !== "")
        validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork(value).catch(() => false));

      return validated;
    },
    description: (value: string) => value.trim() !== "",
    logo: (value: Icon) => value.preview !== "" && value?.raw?.type?.includes("image/svg")
  };

  const [isSettingsValidated, setIsSettingsValidated] = useState(false);
  const [tokensLocked, setTokensLocked] = useState(undefined);
  const [details, setDetails] = useState(undefined);
  const [github, setGithub] = useState(undefined);
  const [tokens, setTokens] = useState(undefined);

  const { activeNetwork } = useNetwork();
  const { searchRepositories, repositoryHasIssues } = useApi();
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokitGraph();

  // Getting external data
  useEffect(() => {
    if (!wallet?.address || !user?.login || !DAOService || (!activeNetwork && !isCreating)) return;

    getUserRepositories(user.login)
      .then(async (githubRepositories) => {
        const filtered = githubRepositories
          .filter(repo => (!repo.isFork && (user.login === repo.nameWithOwner.split("/")[0])) || repo.isOrganization)
          .map(repo => ({
            checked: false,
            isSaved: false,
            hasIssues: false,
            name: repo.name,
            fullName: repo.nameWithOwner
          }));
        
        if (isCreating) return filtered;
        
        let { rows: networkRepositories } = await searchRepositories({ networkName: activeNetwork.name });
        
        const repositories = [];

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
          locked: tokensLockedInRegistry,
          needed: registryCreatorAmount
        }));
      });
  }, [wallet?.address, user?.login, DAOService, activeNetwork]);

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
    const locked = tokensLocked?.amountLocked;
    const needed = tokensLocked?.amountNeeded;

    setTokensLocked(previous => ({
      ...previous,
      validated: locked > 0 && needed > 0 && locked >= needed
    }));
  }, [tokensLocked?.amountLocked, tokensLocked?.amountNeeded]);

  // Details validation
  useEffect(() => {
    const validated = [
      details?.fullLogo?.validated,
      details?.logoIcon?.validated,
      details?.name?.validated,
      details?.description?.validated,
      !details?.theme?.similar?.length,
    ].every(condition => condition);

    setDetails(previous => ({
      ...previous,
      validated
    }));
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