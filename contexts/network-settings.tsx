import { createContext, useContext, useEffect, useMemo, useState } from "react";

import getConfig from "next/config";
import { useRouter } from "next/router";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { isSameSet } from "helpers/array";
import { isColorsSimilar } from "helpers/colors";
import { 
  DEFAULT_CANCEL_FEE, 
  DEFAULT_CLOSE_FEE, 
  DEFAULT_COUNCIL_AMOUNT, 
  DEFAULT_DISPUTE_TIME, 
  DEFAULT_DRAFT_TIME, 
  DEFAULT_PERCENTAGE_FOR_DISPUTE 
} from "helpers/contants";
import { DefaultNetworkSettings } from "helpers/custom-network";

import { Color, Icon, Network, NetworkSettings, Theme } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";
import useOctokit from "x-hooks/use-octokit";

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
  const [settings, setSettings] = useState(DefaultNetworkSettings.settings);
  const [tokensLocked, setTokensLocked] = useState(DefaultNetworkSettings.tokensLocked);
  const [isSettingsValidated, setIsSettingsValidated] = useState(DefaultNetworkSettings.isSettingsValidated);
  
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { DefaultTheme } = useNetworkTheme();
  const { wallet, user } = useAuthentication();
  const { getUserRepositories } = useOctokit();
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
      setter: (value: string) => setDetails(previous => {
        const newState = structuredClone(previous);

        newState.validated = false;
        newState.name.value = value.replace(/\s+/g,"-").replace(/--+/gm, "-");
        newState.name.validated = undefined;

        return newState;
      }),
      validator: async (value: string): Promise<boolean | undefined> => {
        let validated = undefined;
  
        if (value.trim() !== "")
          validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork(value).catch(() => false));

        setDetails(previous => {
          const newState = structuredClone(previous);

          newState.name.validated = validated;
          
          return newState;
        });
  
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
      setter: (value: Color) => setSettings(previous => {
        const newState = structuredClone(previous);

        newState.theme.colors[value.label] = value.code;

        return newState;
      }),
      validator: (value: Theme) => !value?.similar?.length
    },
    repository: {
      setter: (fullName: string) => setGithub(previous => {
        const newState = structuredClone(previous);
        const index = newState.repositories.findIndex((repo) => repo.fullName === fullName);
        const selectedRepository = newState.repositories[index];

        newState.repositories[index].checked = !selectedRepository.checked;

        return newState;
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
      setter: value => setSettings(previous => ({ 
        ...previous, 
        treasury: { 
          ...previous.treasury, 
          address: { value, validated: undefined } 
        } 
      })),
    },
    cancelFee: {
      setter: value => setSettings(previous => ({ 
        ...previous, 
        treasury: { 
          ...previous.treasury, 
          cancelFee: { value, validated: undefined }
        } 
      })),
    },
    closeFee: {
      setter: value => setSettings(previous => ({ 
        ...previous, 
        treasury: { 
          ...previous.treasury, 
          closeFee: { value, validated: undefined }
        } 
      })),
    },
    parameter: {
      setter: value => setSettings(previous => ({ 
        ...previous, 
        parameters: {
          ...previous.parameters,
          [value.label]: { value: value.value, validated: undefined }
        },  
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
          .filter(repo => (!repo?.isFork && (user.login === repo?.nameWithOwner.split("/")[0])) || repo?.isOrganization)
          .map(repo => ({
            checked: false,
            isSaved: false,
            hasIssues: false,
            name: repo?.name,
            fullName: repo?.nameWithOwner
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

    setSettings(previous => ({
      ...previous,
      theme: {
        ...previous.theme,
        colors: isCreating && DefaultTheme() || network?.colors,
      },
    }));

    if (!isCreating) {
      setSettings(previous => {
        const newState = structuredClone(previous);

        newState.parameters.draftTime = { value: network.draftTime, validated: true };
        newState.parameters.disputableTime = { value: network.disputableTime, validated: true };
        newState.parameters.percentageNeededForDispute = { value: network.percentageNeededForDispute, validated: true };
        newState.parameters.councilAmount = { value: network.councilAmount, validated: true };

        return newState;
      });

      setDetails(previous => {
        const newState = structuredClone(previous);

        newState.name = { value: network?.name, validated: undefined };
        newState.description = network?.description;
        newState.fullLogo.value.preview = `${IPFS_URL}/${network?.fullLogo}`;
        newState.iconLogo.value.preview = `${IPFS_URL}/${network?.logoIcon}`;

        return newState;
      });
    } else
      setSettings(previous => {
        const newState = structuredClone(previous);

        newState.parameters.draftTime = { value: DEFAULT_DRAFT_TIME, validated: true };
        newState.parameters.disputableTime = { value: DEFAULT_DISPUTE_TIME, validated: true };
        newState.parameters.percentageNeededForDispute = { value: DEFAULT_PERCENTAGE_FOR_DISPUTE, validated: true };
        newState.parameters.councilAmount = { value: DEFAULT_COUNCIL_AMOUNT, validated: true };
        newState.treasury.cancelFee = { value: DEFAULT_CANCEL_FEE, validated: true };
        newState.treasury.closeFee = { value: DEFAULT_CLOSE_FEE, validated: true };

        return newState;
      });
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
      settings?.validated !== false
    ].every( condition => !!condition ));
  }, [tokensLocked?.validated, details?.validated, github?.validated, tokens?.validated, settings?.validated]);

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
    ].every(condition => condition);

    setDetails(previous => ({
      ...previous,
      validated
    }));
  }, [details?.description, details?.iconLogo, details?.fullLogo, details?.name]);

  // Settings Validation
  useEffect(() => {
    const validated = [
      !settings?.theme?.similar?.length,
      settings?.treasury?.validated,
      settings?.parameters?.draftTime?.validated,
      settings?.parameters?.disputableTime?.validated,
      settings?.parameters?.percentageNeededForDispute?.validated,
      settings?.parameters?.councilAmount?.validated,
    ].every(condition => condition);

    setSettings(previous => ({
      ...previous,
      validated
    }));
  }, [ settings?.theme?.similar,
       settings?.treasury?.validated,
       settings?.parameters?.councilAmount?.validated, 
       settings?.parameters?.disputableTime?.validated, 
       settings?.parameters?.draftTime?.validated, 
       settings?.parameters?.percentageNeededForDispute?.validated ]);

  useEffect(() => {
    const colors = settings?.theme?.colors;
    
    if (!colors?.primary) return;
    
    const similar = [];

    similar.push(...isColorsSimilar({ label: "text", code: colors.text }, [
      { label: "primary", code: colors.primary },
      { label: "background", code: colors.background },
      { label: "shadow", code: colors.shadow },
    ]));

    similar.push(...isColorsSimilar({ label: "background", code: colors.background }, [
        { label: "success", code: colors.success },
        { label: "danger", code: colors.danger },
        { label: "warning", code: colors.warning },
    ]));

    if (!isSameSet(new Set(similar), new Set(settings?.theme?.similar)))
      setSettings(previous => ({
        ...previous,
        theme: {
          ...previous.theme,
          similar
        }
      }));
  }, [settings?.theme?.colors]);

  // Treasury validation
  useEffect(() => {
    if (!DAOService) return;

    const isAddressEmpty = settings?.treasury?.address?.value?.trim() === "";

    const conditionOrUndefined = condition => isAddressEmpty ? undefined : condition;

    Promise.all([
      conditionOrUndefined(DAOService.isAddress(settings?.treasury?.address?.value)),
      conditionOrUndefined(settings?.treasury?.cancelFee?.value >= 0 && settings?.treasury?.cancelFee?.value <= 100),
      conditionOrUndefined(settings?.treasury?.closeFee?.value >= 0 && settings?.treasury?.closeFee?.value <= 100)
    ]).then(validations => {
      setSettings(previous => {
        const newState = structuredClone(previous);

        newState.treasury.address.validated = validations[0];
        newState.treasury.cancelFee.validated = validations[1];
        newState.treasury.closeFee.validated = validations[2];
        newState.treasury.validated = validations.every(condition => condition !== false);

        return newState;
      });
    });
  }, [ DAOService, 
       settings?.treasury?.address?.value, 
       settings?.treasury?.cancelFee?.value, 
       settings?.treasury?.closeFee?.value ]);

  // Parameters Validation
  useEffect(() => {
    setSettings(previous => {
      const newState = structuredClone(previous);

      const validations = [
        Fields.parameter.validator("draftTime", settings?.parameters?.draftTime?.value),
        Fields.parameter.validator("councilAmount", settings?.parameters?.councilAmount?.value),
        Fields.parameter.validator("disputableTime", settings?.parameters?.disputableTime?.value),
        Fields.parameter.validator("percentageNeededForDispute", 
                                   settings?.parameters?.percentageNeededForDispute?.value)
      ];

      newState.parameters.draftTime.validated = validations[0];
      newState.parameters.councilAmount.validated = validations[1];
      newState.parameters.disputableTime.validated = validations[2];
      newState.parameters.percentageNeededForDispute.validated = validations[3];
      newState.parameters.validated = validations.every(condition => condition);

      return newState;
    });
  }, [ settings?.parameters?.councilAmount?.value, 
       settings?.parameters?.disputableTime?.value, 
       settings?.parameters?.draftTime?.value, 
       settings?.parameters?.percentageNeededForDispute?.value ]);

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

  const memorizedValue = useMemo<NetworkSettings>(() => ({
    tokensLocked,
    details,
    github,
    tokens,
    settings,
    isSettingsValidated,
    forcedNetwork,
    setForcedNetwork,
    fields: Fields
  }), [tokensLocked, details, github, tokens, settings, isSettingsValidated, Fields, setForcedNetwork]);

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