import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { DefaultNetworkSettings } from "helpers/custom-network";

import { Color, Icon, NetworkSettings, Theme } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useOctokitGraph from "x-hooks/use-octokit-graph";

const NetworkSettingsContext = createContext<NetworkSettings | undefined>(undefined);

const ALLOWED_PATHS = ["/new-network", "/[network]/account/my-network/settings"];

export const NetworkSettingsProvider = ({ children }) => {
  const router = useRouter();
  
  const [github, setGithub] = useState(DefaultNetworkSettings.github);
  const [tokens, setTokens] = useState(DefaultNetworkSettings.tokens);
  const [details, setDetails] = useState(DefaultNetworkSettings.details);
  const [tokensLocked, setTokensLocked] = useState(DefaultNetworkSettings.tokensLocked);
  const [isSettingsValidated, setIsSettingsValidated] = useState(DefaultNetworkSettings.isSettingsValidated);
  
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokitGraph();
  const { getNetwork, searchRepositories, repositoryHasIssues } = useApi();

  const isCreating = useMemo(() => router.pathname === "/new-network", [router.pathname]);
  const needsToLoad = useMemo(() => ALLOWED_PATHS.includes(router.pathname), [router.pathname]);

  const Fields = {
    amount: {
      setter: (value: number) => setTokensLocked(previous => ({ ...previous, amount: value })),
      validator: (locked: number, needed: number) => needed > 0 && locked >= needed
    },
    name: {
      setter: (value: string) => setDetails(previous => ({
        ...previous, 
        validated: false, 
        name: { 
          value, 
          validated: undefined 
        } 
      })),
      validator: async (value: string): Promise<boolean | undefined> => {
        let validated = undefined;
  
        if (value.trim() !== "")
          validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork(value).catch(() => false));

        setDetails(previous => ({
          ...previous,
          validated,
        }));
  
        return validated;
      }
    },
    description: {
      setter: (value: string) => setDetails(previous => ({ ...previous, description: value })),
      validator: (value: string) => value.trim() !== ""
    },
    logo: {
      setter: (value: Icon, type: "full" | "icon") => setDetails(previous => ({ ...previous, [`${type}Logo`]: value })),
      validator: (value: Icon) => value?.preview !== "" && value?.raw?.type?.includes("image/svg")
    },
    colors: {
      setter: (value: Color) => setDetails(previous => ({ 
        ...previous, 
        theme: { 
          ...previous.theme, 
          colors: {
            ...previous.theme.colors,
            [value.label]: value.code
          } 
        } 
      })),
      validator: (value: Theme) => !value?.similar?.length
    },
    repository: {
      setter: (fullName: string) => setGithub(previous => {
        const tmpRepositories = previous.repositories;
        const index = tmpRepositories.findIndex((repo) => repo.fullName === fullName);
        const selectedRepository = tmpRepositories[index];

        tmpRepositories[index] = {
          ...selectedRepository,
          checked: !selectedRepository.checked
        };

        return { ...previous, repositories: tmpRepositories };
      }),
    },
    permission: {
      setter: (value) => setGithub(previous => ({ ...previous, botPermission: value }))
    }
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
  }, [wallet?.address, user?.login, DAOService, activeNetwork, isCreating, needsToLoad]);

  useEffect(() => {
    if (wallet?.balance)
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
  }, [wallet?.balance]);

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
      validated: Fields.amount.validator(tokensLocked?.locked, tokensLocked?.needed)
    }));
  }, [tokensLocked?.locked, tokensLocked?.needed]);

  // Details validation
  useEffect(() => {
    console.log("validating", details?.fullLogo?.value);

    if (details?.name?.value?.trim() !== "")
      Fields.name.validator(details?.name.value)
      .then(nameValidated => {
        const validated = [
          nameValidated,
          Fields.logo.validator(details?.fullLogo?.value),
          Fields.logo.validator(details?.iconLogo?.value),
          Fields.description.validator(details?.description),
          Fields.colors.validator(details?.theme),
        ].every(condition => condition);
    
        setDetails(previous => ({
          ...previous,
          validated
        }));
      });
    else {
      const validated = [
        false,
        Fields.logo.validator(details?.fullLogo?.value),
        Fields.logo.validator(details?.iconLogo?.value),
        Fields.description.validator(details?.description),
        Fields.colors.validator(details?.theme),
      ].every(condition => condition);
  
      setDetails(previous => ({
        ...previous,
        validated
      }));
    }
  }, [details?.name, details?.description, details?.iconLogo, details?.fullLogo, details?.theme]);

  // Github validation
  useEffect(() => {
    if (!github?.repositories?.length) return;

    const validated = [
      github?.repositories?.some((repository) => repository.checked),
      github?.botPermission
    ].every(condition => condition);

    setGithub(previous => ({
      ...previous,
      validated
    }));
  }, [github?.repositories, github?.botPermission]);

  const memorizedValue = useMemo<NetworkSettings>(() => ({
    tokensLocked,
    details,
    github,
    tokens,
    isSettingsValidated,
    fields: Fields
  }), [tokensLocked, details, github, tokens, isSettingsValidated, Fields]);

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