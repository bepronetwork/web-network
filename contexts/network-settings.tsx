import { createContext, useContext, useEffect, useMemo, useState } from "react";

import getConfig from "next/config";
import { useRouter } from "next/router";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { isSameSet } from "helpers/array";
import { isColorsSimilar } from "helpers/colors";
import { DefaultNetworkSettings } from "helpers/custom-network";

import { Color, Icon, Network, NetworkSettings, Theme } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";
import useOctokitGraph from "x-hooks/use-octokit-graph";

const { publicRuntimeConfig } = getConfig();

const IPFS_URL = publicRuntimeConfig?.ipfsUrl;

const NetworkSettingsContext = createContext<NetworkSettings | undefined>(undefined);

const ALLOWED_PATHS = ["/new-network", "/[network]/account/my-network/settings", "/administration"];

const LIMITS = {
  percentageNeededForDispute: { max: +publicRuntimeConfig?.networkConfig?.disputesPercentage },
  draftTime: {
    min: +publicRuntimeConfig?.networkConfig?.reedemTime?.min,
    max: +publicRuntimeConfig?.networkConfig?.reedemTime?.max,
  },
  disputableTime: {
    min: +publicRuntimeConfig?.networkConfig?.disputableTime?.min,
    max: +publicRuntimeConfig?.networkConfig?.disputableTime?.max,
  },
  councilAmount: {
    min: +publicRuntimeConfig?.networkConfig?.councilAmount?.min,
    max: +publicRuntimeConfig?.networkConfig?.councilAmount?.max
  }
};

export const NetworkSettingsProvider = ({ children }) => {
  const router = useRouter();
  
  const [forcedNetwork, setForcedNetwork] = useState<Network>();
  const [github, setGithub] = useState(DefaultNetworkSettings.github);
  const [tokens, setTokens] = useState(DefaultNetworkSettings.tokens);
  const [details, setDetails] = useState(DefaultNetworkSettings.details);
  const [treasury, setTreasury] = useState(DefaultNetworkSettings.treasury);
  const [parameters, setParameters] = useState(DefaultNetworkSettings.parameters);
  const [tokensLocked, setTokensLocked] = useState(DefaultNetworkSettings.tokensLocked);
  const [isSettingsValidated, setIsSettingsValidated] = useState(DefaultNetworkSettings.isSettingsValidated);
  
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { DefaultTheme } = useNetworkTheme();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokitGraph();
  const { getNetwork, searchRepositories, repositoryHasIssues } = useApi();

  const isCreating = useMemo(() => router.pathname === "/new-network", [router.pathname]);
  const needsToLoad = useMemo(() => ALLOWED_PATHS.includes(router.pathname), [router.pathname]);
  const network = useMemo(() => forcedNetwork || activeNetwork, [forcedNetwork, activeNetwork]);

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
          value: value.replace(/\s+/g,"-").replace(/--+/gm, "-"), 
          validated: undefined 
        } 
      })),
      validator: async (value: string): Promise<boolean | undefined> => {
        let validated = undefined;
  
        if (value.trim() !== "")
          validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork(value).catch(() => false));

        setDetails(previous => ({
          ...previous,
          name: {
            ...previous.name,
            validated
          }
        }));
  
        return validated;
      }
    },
    description: {
      setter: (value: string) => setDetails(previous => ({ ...previous, description: value })),
      validator: (value: string) => value.trim() !== ""
    },
    logo: {
      setter: (value: Icon, type: "full" | "icon") => setDetails(previous => ({ 
        ...previous, 
        [`${type}Logo`]: { 
          value,
          validated: value?.preview !== "" && value?.raw?.type?.includes("image/svg")
        }
      })),
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
      validator: value => value.some((repository) => repository.checked)
    },
    permission: {
      setter: value => setGithub(previous => ({ ...previous, botPermission: value }))
    },
    settlerToken: {
      setter: value => setTokens(previous => ({ ...previous, settler: value })),
    },
    bountyToken: {
      setter: value => setTokens(previous => ({ ...previous, bounty: value })),
    },
    bountyURI: {
      setter: value => setTokens(previous => ({ ...previous, bountyURI: value })),
    },
    treasury: {
      setter: value => setTreasury(previous => ({ ...previous, address: { value, validated: undefined } })),
    },
    cancelFee: {
      setter: value => setTreasury(previous => ({ ...previous, cancelFee: value })),
    },
    closeFee: {
      setter: value => setTreasury(previous => ({ ...previous, closeFee: value })),
    },
    parameter: {
      setter: value => setParameters(previous => ({ 
        ...previous, 
        [value.label]: { value: value.value, validated: undefined },  
      })),
      validator: 
        (parameter, value) => value >= (LIMITS[parameter].min || value) && value <= (LIMITS[parameter].max || value)
    }
  };

  // Getting external data
  useEffect(() => {
    if ( !wallet?.address || 
         !user?.login || 
         !DAOService || 
         !network?.name || 
         !network?.councilAmount || 
         !needsToLoad ) 
      return;

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
          let { rows: networkRepositories } = await searchRepositories({ networkName: network.name });

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

    setDetails(previous => ({
      ...previous,
      theme: {
        ...previous.theme,
        colors: isCreating && DefaultTheme() || network?.colors,
      },
      ...(isCreating && {} || {
        name: {
          value: network?.name,
          validated: undefined
        },
        description: network?.description,
        fullLogo: {
          ...previous.fullLogo,
          value: {
            ...previous.fullLogo.value,
            preview: `${IPFS_URL}/${network.fullLogo}`
          }
        },
        iconLogo: {
          ...previous.iconLogo,
          value: {
            ...previous.iconLogo.value,
            preview: `${IPFS_URL}/${network.logoIcon}`
          }
        }
      })
    }));

    if (!isCreating)
      setParameters(previous => ({
        ...previous,
        draftTime: { value: network.draftTime, validated: true },
        disputableTime: { value: network.disputableTime, validated: true },
        percentageNeededForDispute: { value: network.percentageNeededForDispute, validated: true },
        councilAmount: { value: network.councilAmount, validated: true },
      }));
  }, [ wallet?.address, 
       user?.login, 
       DAOService, 
       network?.name, 
       network?.councilAmount, 
       isCreating, 
       needsToLoad ]);

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
      tokens?.validated,
      treasury?.validated !== false
    ].every( condition => !!condition ));
  }, [tokensLocked?.validated, details?.validated, github?.validated, tokens?.validated, treasury?.validated]);

  // Tokens locked validation
  useEffect(() => {
    setTokensLocked(previous => ({
      ...previous,
      validated: Fields.amount.validator(tokensLocked?.locked, tokensLocked?.needed)
    }));
  }, [tokensLocked?.locked, tokensLocked?.needed]);

  // Details validation
  useEffect(() => {
    const validated = [
      details?.name?.validated,
      Fields.logo.validator(details?.fullLogo?.value),
      Fields.logo.validator(details?.iconLogo?.value),
      Fields.description.validator(details?.description),
      Fields.colors.validator(details?.theme),
    ].every(condition => condition);

    setDetails(previous => ({
      ...previous,
      validated
    }));
  }, [details?.validated, details?.description, details?.iconLogo, details?.fullLogo, details?.theme]);

  useEffect(() => {
    const colors = details?.theme?.colors;
    
    if (!colors?.primary) return;
    
    const similar = [];

    similar.push(...isColorsSimilar({ label: "text", code: colors.text }, [
      { label: "primary", code: colors.primary },
      { label: "background", code: colors.background },
      { label: "shadow", code: colors.shadow },
    ]));

    similar.push(...isColorsSimilar({ label: "background", code: colors.background }, [
        { label: "success", code: colors.success },
        { label: "fail", code: colors.fail },
        { label: "warning", code: colors.warning },
    ]));

    if (!isSameSet(new Set(similar), new Set(details?.theme?.similar)))
      setDetails(previous => ({
        ...previous,
        theme: {
          ...previous.theme,
          similar
        }
      }));
  }, [details?.theme?.colors]);

  // Github validation
  useEffect(() => {
    if (!github?.repositories?.length) return;

    const validated = [
      Fields.repository.validator(github?.repositories),
      github?.botPermission
    ].every(condition => condition);

    if (validated !== github?.validated)
      setGithub(previous => ({
        ...previous,
        validated
      }));
  }, [github]);

  // Tokens validation
  useEffect(() => {
    const validated = [
      tokens?.settler?.trim() !== "",
      tokens?.bounty?.trim() !== "",
      tokens?.bountyURI?.trim() !== ""
    ].every(condition => condition);

    setTokens(previous => ({
      ...previous,
      validated
    }));
  }, [tokens?.settler, tokens?.bounty, tokens?.bountyURI]);

  // Treasury validation
  useEffect(() => {
    if (!DAOService) return;

    if (treasury?.address?.value?.trim() === "")
      setTreasury(previous => ({
        ...previous,
        address: {
          ...previous.address,
          validated: undefined
        },
        validated: undefined
      }));
    else
      Promise.all([
        DAOService.isAddress(treasury?.address?.value),
        treasury?.cancelFee >= 0 && treasury?.cancelFee <= 100,
        treasury?.closeFee >= 0 && treasury?.closeFee <= 100
      ]).then((validations) => {
        setTreasury(previous => ({
          ...previous,
          address: {
            ...previous.address,
            validated: validations[0]
          },
          validated: validations.every(condition => condition)
        }));
      });
  }, [DAOService, treasury?.address?.value, treasury?.cancelFee, treasury?.closeFee]);

  // Parameters Validation
  useEffect(() => {
    setParameters(previous => ({
      ...previous,
      draftTime: { 
        ...previous.draftTime,
        validated: Fields.parameter.validator("draftTime", parameters?.draftTime?.value)
      },
      councilAmount: { 
        ...previous.councilAmount,
        validated: Fields.parameter.validator("councilAmount", parameters?.councilAmount?.value)
      },
      disputableTime: { 
        ...previous.disputableTime,
        validated: Fields.parameter.validator("disputableTime", parameters?.disputableTime?.value)
      },
      percentageNeededForDispute: { 
        ...previous.percentageNeededForDispute,
        validated: 
          Fields.parameter.validator("percentageNeededForDispute", parameters?.percentageNeededForDispute?.value)
      }
    }));
  }, [ parameters?.councilAmount?.value, 
       parameters?.disputableTime?.value, 
       parameters?.draftTime?.value, 
       parameters?.percentageNeededForDispute?.value ]);

  const memorizedValue = useMemo<NetworkSettings>(() => ({
    tokensLocked,
    details,
    github,
    tokens,
    treasury,
    isSettingsValidated,
    parameters,
    forcedNetwork,
    setForcedNetwork,
    fields: Fields
  }), [tokensLocked, details, github, tokens, treasury, parameters, isSettingsValidated, Fields, setForcedNetwork]);

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