import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Defaults } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
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

import { Color, Network, NetworkSettings, Theme } from "interfaces/network";

import DAO from "services/dao-service";
import { WinStorage } from "services/win-storage";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";
import useOctokit from "x-hooks/use-octokit";

import { useSettings } from "./settings";

const NetworkSettingsContext = createContext<NetworkSettings | undefined>(undefined);

const ALLOWED_PATHS = ["/new-network", "/[network]/profile/my-network", "/administration"];
const TTL = 48 * 60 * 60 // 2 day
const storage = new WinStorage('create-network-settings', TTL, "localStorage");

export const NetworkSettingsProvider = ({ children }) => {
  const router = useRouter();
  
  /* NOTE - forced network might be renamed to `user network`, 
            referred to user nework when he access `/my-network` page from/in another network.
  */
  const [forcedNetwork, setForcedNetwork] = useState<Network>();
  const [networkSettings, setNetworkSettings] = useState(DefaultNetworkSettings)
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { DefaultTheme } = useNetworkTheme();
  const { wallet, user } = useAuthentication();
  
  const { getUserRepositories } = useOctokit();
  const { settings: appSettings } = useSettings();
  const { getNetwork, searchRepositories, repositoryHasIssues } = useApi();

  const IPFS_URL = appSettings?.urls?.ipfs;
  const LIMITS = {
    percentageNeededForDispute: appSettings?.networkParametersLimits?.disputePercentage,
    draftTime: appSettings?.networkParametersLimits?.draftTime,
    disputableTime: appSettings?.networkParametersLimits?.disputableTime,
    councilAmount: appSettings?.networkParametersLimits?.councilAmount
  };

  const isCreating = useMemo(() => router.pathname === "/new-network", [router.pathname]);
  const needsToLoad = useMemo(() => ALLOWED_PATHS.includes(router.pathname), [router.pathname]);
  const network = useMemo(() => forcedNetwork || activeNetwork, [forcedNetwork, activeNetwork]);

  function handlerValidateSettings(settings){
    //Treasury
    if (DAOService) {
      const isAddressEmptyOrZeroAddress = settings?.treasury?.address?.value?.trim() === "" || 
      settings?.treasury?.address?.value === Defaults.nativeZeroAddress;

      const conditionOrUndefined = condition => isAddressEmptyOrZeroAddress ? undefined : condition;

      Promise.all([
      conditionOrUndefined(DAOService.isAddress(settings?.treasury?.address?.value)),
      conditionOrUndefined(settings?.treasury?.cancelFee?.value >= 0 && settings?.treasury?.cancelFee?.value <= 100),
      conditionOrUndefined(settings?.treasury?.closeFee?.value >= 0 && settings?.treasury?.closeFee?.value <= 100),
      ]).then((treasuryValidator)=>{
        settings.treasury.address.validated = treasuryValidator[0];
        settings.treasury.cancelFee.validated = treasuryValidator[1]
        settings.treasury.closeFee.validated = treasuryValidator[2]
        settings.treasury.validated = treasuryValidator.every(condition => condition !== false);
      })
      
    }

    //Parameters
    const parametersValidations = [
      Fields.parameter.validator("draftTime", settings?.parameters?.draftTime?.value),
      Fields.parameter.validator("councilAmount", settings?.parameters?.councilAmount?.value),
      Fields.parameter.validator("disputableTime", settings?.parameters?.disputableTime?.value),
      Fields.parameter.validator("percentageNeededForDispute", 
                                 settings?.parameters?.percentageNeededForDispute?.value)
    ];

    settings.parameters.draftTime.validated = parametersValidations[0];
    settings.parameters.councilAmount.validated = parametersValidations[1];
    settings.parameters.disputableTime.validated = parametersValidations[2];
    settings.parameters.percentageNeededForDispute.validated = parametersValidations[3];
    settings.parameters.validated = parametersValidations.every(condition => condition);
    //Theme
    const colors = settings.theme?.colors;
    
    if (colors?.primary){
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

      if (!isSameSet(new Set(similar), new Set(settings.theme?.similar)))
        settings.theme.similar = similar;
    }

    return settings;
  }

  function handerValidateForm(newState) {

    const tokensLockedValidate = [
      Fields.amount.validator(newState.tokensLocked?.locked, newState.tokensLocked?.needed)
    ].every(condition => condition);
      
    const detailsValidate = [
      newState.details.name.validated,
      newState.details.fullLogo.validated,
      newState.details.iconLogo.validated,
    ].every(condition => condition);

    const githubValidate = [
        Fields.repository.validator(newState.github?.repositories),
        newState.github?.botPermission,
    ].every(condition => condition);
    
    newState.settings = handlerValidateSettings(newState.settings)

    const settingsValidated = [
    !newState.settings?.theme?.similar?.length,
    newState.settings?.treasury?.validated,
    newState.settings?.parameters?.draftTime?.validated,
    newState.settings?.parameters?.disputableTime?.validated,
    newState.settings?.parameters?.percentageNeededForDispute?.validated,
    newState.settings?.parameters?.councilAmount?.validated,
    ].every(condition => condition);
    
    const tokensValidated = [
      newState.tokens?.settler?.trim() !== "",
    ].every(condition => condition);
    
    newState.tokensLocked.validated = tokensLockedValidate;
    newState.details.validated = detailsValidate;
    newState.github.validated = githubValidate;
    newState.settings.validated = !!settingsValidated;
    newState.tokens.validated = tokensValidated;
    newState.isSettingsValidated = [tokensLockedValidate,
                                    detailsValidate,
                                    githubValidate,
                                    settingsValidated,
                                    tokensValidated,
    ].every(condtion=> condtion)

    if(detailsValidate && isCreating){
      const data = Object.keys(newState)
                          .filter(key => newState[key].validated)
                          .reduce((obj, key) => {
                            obj[key] = newState[key]
                            return obj
                          }, {});

      storage.setItem(data);
    }
    
    return newState;
  }

  const setFields = (field: string, value: unknown) => {
    const method = field.split('.')
    
    if(!method) return;

    setNetworkSettings((prev)=>{
      const newValues = {...prev}

      method.reduce((p,c)=> 
          c === method[method.length-1] ? p[c] = value : p[c]
        , newValues)

      return handerValidateForm(newValues)
    })
  }
  
  const Fields = {
    amount: {
      setter: (value: string) => setFields('tokensLocked.amount', value),
      validator: (locked: string, needed: string) => BigNumber(needed).gt(0) && BigNumber(locked).gte(needed)
    },
    name: {
      setter: async (value: string) => {
        setFields('details.name', {value, validated: await Fields.name.validator(value)})
      },
      validator: async (value: string) => {
        let validated = undefined;
  
        if (value.trim() !== "")
          validated = /bepro|taikai/gi.test(value) ? false : !(await getNetwork({name: value}).catch(() => false));

        return !!validated;
      }
    },
    description: {
      setter: (value: string) => setFields('details.description', value),
    },
    logo: {
      setter: (value, type: "full" | "icon") => {
        setFields(`details.${type}Logo`, {
                    value,
                    validated: value?.preview !== "" && value?.raw?.type?.includes("image/svg")
        })
      }
    },
    colors: {
      setter: (value: Color) => setFields(`settings.theme.colors.${value.label}`, value.code),
      validator: (value: Theme) => !value?.similar?.length
    },
    repository: {
      setter: (fullName: string) =>{
        const index = networkSettings.github.repositories.findIndex((repo) => repo.fullName === fullName);
        const selectedRepository = networkSettings.github.repositories[index];
        selectedRepository.checked = !selectedRepository.checked;
        setFields(`github.repositories.${index}`, selectedRepository)
      },
      validator: value => value.some((repository) => repository.checked)
    },
    permission: {
      setter: value => setFields(`github.botPermission`, !!value)
    },
    settlerToken: {
      setter: value => setFields(`tokens.settler`, value)
    },
    allowedTransactions: {
      setter: value => setFields(`tokens.allowedTransactions`, value)
    },
    allowedRewards: {
      setter: value => setFields(`tokens.allowedRewards`, value)
    },
    treasury: {
      setter: value => setFields(`settings.treasury.address.value`, value)
    },
    cancelFee: {
      setter: value => setFields(`settings.treasury.cancelFee.value`, value)
    },
    closeFee: {
      setter: value => setFields(`settings.treasury.closeFee.value`, value)
    },
    parameter: {
      setter: value =>  setFields(`settings.parameters.${[value.label]}.value`, value.value),
      validator: 
        (parameter, value) => value >= (LIMITS[parameter]?.min || value) && value <= (LIMITS[parameter]?.max || value)
    }
  };

  async function loadDaoService(): Promise<DAO> {
    if (!forcedNetwork) return DAOService;

    const networkAddress = network?.networkAddress;
    const dao = new DAO({
      web3Connection: DAOService.web3Connection,
      skipWindowAssignment: true
    });

    await dao.loadNetwork(networkAddress);

    return dao;
  }
  
  const cleanStorage = () => storage.removeItem();

  async function getTokenBalance() {
    const [tokensLockedInRegistry, registryCreatorAmount] = await Promise.all([
      DAOService.getTokensLockedInRegistryByAddress(wallet.address),
      DAOService.getRegistryCreatorAmount()
    ])

    return {
      locked: BigNumber(tokensLockedInRegistry).toFixed(),
      needed: BigNumber(registryCreatorAmount).toFixed(),
      validated: BigNumber(tokensLockedInRegistry).isGreaterThanOrEqualTo(registryCreatorAmount),
    }
    
  }

  async function updateTokenBalance(){
    const balance = await getTokenBalance()
    const tokensLocked = {...networkSettings.tokensLocked, ...balance}
    setFields('tokensLocked', tokensLocked)
    return tokensLocked;
  }

  async function loadGHRepos(){
    const repositories = [];
    
    if(user?.login){
      const githubRepositories = await getUserRepositories(user?.login)
    
      const filtered = githubRepositories
          .filter(repo => {
            const isOwner = user.login === repo?.nameWithOwner.split("/")[0];
            
            if((!repo?.isFork && isOwner || repo?.isInOrganization) && !repo?.isArchived)
              return repo
          })
          .map(repo => ({
            checked: false,
            isSaved: false,
            hasIssues: false,
            userPermission:repo.viewerPermission,
            name: repo?.name,
            fullName: repo?.nameWithOwner
          }));
        
      
      if (!isCreating){
        const repositoryAlreadyExists =  await searchRepositories({ networkName: network?.name })
            .then(({ rows }) => 
            Promise.all(rows.map( async repo => ({
              checked: true,
              isSaved: true,
              name: repo.githubPath.split("/")[1],
              fullName: repo.githubPath,
              hasIssues: await repositoryHasIssues(repo.githubPath)
            }))))
        repositories.push(...repositoryAlreadyExists)
      }
  
      repositories.push(...filtered.filter(repo => !repositories.find((repoB) => repoB.fullName === repo.fullName)));
    }
    
    return repositories;
  }

  async function loadDefaultSettings(): Promise<typeof DefaultNetworkSettings>{
    const defaultState = DefaultNetworkSettings;

    const balance = await getTokenBalance();

    defaultState.tokensLocked = {
      amount: '0',
      ...balance,
    }

    defaultState.settings.theme.colors = DefaultTheme();
    
    defaultState.settings.parameters = {
        draftTime: {
          value: DEFAULT_DRAFT_TIME,
          validated: undefined
        },
        disputableTime: {
          value: DEFAULT_DISPUTE_TIME,
          validated: undefined
        },
        percentageNeededForDispute: {
          value: DEFAULT_PERCENTAGE_FOR_DISPUTE,
          validated: undefined
        },
        councilAmount: {
          value: DEFAULT_COUNCIL_AMOUNT,
          validated: undefined
        },
        validated: undefined
    }

    defaultState.settings.treasury.cancelFee = { value:DEFAULT_CANCEL_FEE, validated: true };
    defaultState.settings.treasury.closeFee = { value: DEFAULT_CLOSE_FEE, validated: true };

    defaultState.github.repositories = await loadGHRepos();

    defaultState.tokens.settler = appSettings?.beproToken?.address;

    const storageData = storage.getItem();

    if(storageData){
      if(storageData?.details){
        defaultState.details.name =  storageData?.details.name;
        defaultState.details.description =  storageData?.details.description;
      }

      if(storageData?.settings)
        defaultState.settings = storageData?.settings;
        
      if(storageData?.github)
        defaultState.github = storageData?.github;

      if(storageData?.tokens)
        defaultState.tokens = storageData?.tokens;
    }
    
    setNetworkSettings(defaultState);

    return defaultState;
  }

  async function loadNetworkSettings(): Promise<typeof DefaultNetworkSettings>{
    const defaultState = DefaultNetworkSettings;
    const service = await loadDaoService()
    const [
        treasury,
        councilAmount, 
        disputableTime, 
        draftTime, 
        percentageNeededForDispute, 
        isNetworkAbleToBeClosed,
      ] = await Promise.all([
        service.getTreasury(),
        service.getNetworkParameter("councilAmount"),
        service.getNetworkParameter("disputableTime"),
        service.getNetworkParameter("draftTime"),
        service.getNetworkParameter("percentageNeededForDispute"),
        service.isNetworkAbleToBeClosed(),
      ])

    defaultState.settings.parameters = {
        draftTime: {
          value: +draftTime / 1000,
          validated: true
        },
        disputableTime: {
          value: +disputableTime / 1000,
          validated: true
        },
        percentageNeededForDispute: {
          value: +percentageNeededForDispute,
          validated: true
        },
        councilAmount: {
          value: +councilAmount,
          validated: true
        },
        validated: true
    }

    defaultState.settings.treasury.address = {value: treasury.treasury, validated: true}
    defaultState.settings.treasury.cancelFee = { value: treasury.closeFee, validated: true };
    defaultState.settings.treasury.closeFee = { value: treasury.cancelFee, validated: true };

    defaultState.details.name = {value: network?.name, validated: true}
    defaultState.details.description = network?.description

    defaultState.details.fullLogo = {
      value: {
        preview:`${IPFS_URL}/${network?.fullLogo}`, 
        raw: undefined
      }, 
      validated: true
    }
    defaultState.details.iconLogo = {
      value: {
        preview:`${IPFS_URL}/${network?.logoIcon}`, 
        raw: undefined
      }, 
      validated: true
    }
    defaultState.isAbleToClosed = isNetworkAbleToBeClosed;
    defaultState.settings.theme.colors = network?.colors || DefaultTheme();
    defaultState.github.repositories = await loadGHRepos();

    setNetworkSettings(defaultState)
    return defaultState;
  }

  useEffect(() => {
    if ([
      !DAOService,
      !wallet?.address,
      !isCreating && !network?.name && !network?.councilAmount, 
      isCreating && !appSettings?.beproToken?.address,
      !needsToLoad
    ].some(c => c))
      return;
    
    setIsLoadingData(true);

    if (!isCreating && forcedNetwork)
      loadNetworkSettings().finally(()=> setIsLoadingData(false));
    else if(isCreating)
      loadDefaultSettings().finally(()=> setIsLoadingData(false));
  }, [ 
    user?.login,
    wallet?.address,
    DAOService, 
    network, 
    isCreating, 
    forcedNetwork,
    needsToLoad,
    router.pathname,
    appSettings?.beproToken?.address
  ]);
  
  // NOTE -  Load Forced/User Network
  useEffect(()=>{
    if(DAOService && forcedNetwork && (!forcedNetwork?.tokensLocked || !forcedNetwork.tokensStaked))
      loadDaoService()
      .then((service)=> 
       Promise.all([  
                service.getTotalNetworkToken(),
                0,
                service.getNetworkParameter("councilAmount"),
                service.getNetworkParameter("disputableTime"),
                service.getNetworkParameter("draftTime"),
                service.getNetworkParameter("percentageNeededForDispute")
       ]))
       .then(([
        tokensLocked,
        tokensStaked,
        councilAmount, 
        disputableTime, 
        draftTime, 
        percentageNeededForDispute, ])=>
         setForcedNetwork((prev)=>({
          ...prev, 
          tokensLocked: tokensLocked.toFixed(),
          tokensStaked: tokensStaked.toFixed(),
          councilAmount: councilAmount.toString(),
          disputableTime: +disputableTime / 1000,
          draftTime: +draftTime / 1000,
          percentageNeededForDispute: +percentageNeededForDispute,
         })))
  },[forcedNetwork, DAOService])


  const memorizedValue = useMemo<NetworkSettings>(() => ({
    ...networkSettings,
    forcedNetwork,
    isLoadingData,
    setForcedNetwork,
    LIMITS,
    cleanStorage,
    updateTokenBalance,
    fields: Fields
  }), [networkSettings, Fields, LIMITS, setForcedNetwork]);

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