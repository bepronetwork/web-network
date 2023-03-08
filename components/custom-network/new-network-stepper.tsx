import {useEffect, useState} from "react";

import {Defaults} from "@taikai/dappkit";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import AlreadyHasNetworkModal from "components/already-has-network-modal";
import ConnectWalletButton from "components/connect-wallet-button";
import CreatingNetworkLoader from "components/creating-network-loader";
import LockBeproStep from "components/custom-network/lock-bepro-step";
import NetworkInformationStep from "components/custom-network/network-information-step";
import NetworkSettingsStep from "components/custom-network/network-settings-step";
import SelectRepositoriesStep from "components/custom-network/select-repositories-step";
import TokenConfiguration from "components/custom-network/token-configuration";
import Stepper from "components/stepper";

import {useAppState} from "contexts/app-state";
import {NetworkSettingsProvider, useNetworkSettings} from "contexts/network-settings";
import {changeLoadState} from "contexts/reducers/change-load";
import {addToast} from "contexts/reducers/change-toaster";

import {
  DEFAULT_CANCELABLE_TIME,
  DEFAULT_COUNCIL_AMOUNT,
  DEFAULT_DISPUTE_TIME,
  DEFAULT_DRAFT_TIME,
  DEFAULT_MERGER_FEE,
  DEFAULT_ORACLE_EXCHANGE_RATE,
  DEFAULT_PERCENTAGE_FOR_DISPUTE,
  DEFAULT_PROPOSER_FEE
} from "helpers/constants";
import {psReadAsText} from "helpers/file-reader";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network-theme";

function NewNetwork() {
  const router = useRouter();

  const { t } = useTranslation(["common", "custom-network"]);

  const [creatingNetwork, setCreatingNetwork] = useState<number>(-1);
  const [hasNetwork, setHasNetwork] = useState(false);

  const { state, dispatch } = useAppState();

  const { createNetwork, processEvent } = useApi();
  const { handleChangeNetworkParameter } = useBepro();
  const { getURLWithNetwork, colorsToCSS } = useNetworkTheme();
  const { tokensLocked, details, github, tokens, settings, isSettingsValidated, cleanStorage } = useNetworkSettings();
  const { handleDeployNetworkV2, handleAddNetworkToRegistry } = useBepro();

  const defaultNetworkName = state?.Service?.network?.active?.name.toLowerCase();
  const isSetupPage = router?.pathname?.toString()?.includes("setup");
    
  const creationSteps = [
    { id: 1, name: t("custom-network:modals.loader.steps.deploy-network") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-draft-time") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-disputable-time") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-dispute-percentage") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-council-amount") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-cancelable-time") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-oracle-exchange-rate") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-merger-fee") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-proposer-fee") },
    { id: 2, name: t("custom-network:modals.loader.steps.add-to-registry") },
    { id: 3, name: t("custom-network:modals.loader.steps.sync-web-network") }
  ];

  async function handleCreateNetwork() {
    if (!state.currentUser?.login || !state.currentUser?.walletAddress || !state.Service?.active) return;
    setCreatingNetwork(0);

    const deployNetworkTX = await handleDeployNetworkV2(tokens.settler).catch(error => error);

    if (!deployNetworkTX?.contractAddress) return setCreatingNetwork(-1);

    const deployedNetworkAddress = deployNetworkTX.contractAddress;

    const payload = {
      name: details.name.value,
      description: details.description,
      colors: JSON.stringify(settings.theme.colors),
      logoIcon: await psReadAsText(details.iconLogo.value.raw),
      fullLogo: await psReadAsText(details.fullLogo.value.raw),
      repositories: 
        JSON.stringify(github.repositories
          .filter((repo) => repo.checked)
          .filter((repo) => repo?.userPermission === "ADMIN")
          .map(({ name, fullName }) => ({ name, fullName }))),
      botPermission: github.botPermission,
      creator: state.currentUser.walletAddress,
      accessToken: state.currentUser.accessToken,
      githubLogin: state.currentUser.login,
      allowedTokens: tokens,
      networkAddress: deployedNetworkAddress,
      isDefault: isSetupPage
    };

    const networkCreated = await createNetwork(payload)
      .catch((error) => {
        setCreatingNetwork(-1);
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-create-network", {
              error,
            }),
        }));

        return false;
      });

    if (!networkCreated) return;

    const draftTime = settings.parameters.draftTime.value;
    const disputableTime = settings.parameters.disputableTime.value;
    const councilAmount = settings.parameters.councilAmount.value;
    const percentageForDispute = settings.parameters.percentageNeededForDispute.value;
    const cancelableTime = settings.parameters.cancelableTime.value;
    const oracleExchangeRate = settings.parameters.oracleExchangeRate.value;
    const mergerFee = settings.parameters.mergeCreatorFeeShare.value;
    const proposerFee = settings.parameters.proposerFeeShare.value;

    if (draftTime !== DEFAULT_DRAFT_TIME) {
      setCreatingNetwork(1);
      await handleChangeNetworkParameter("draftTime", draftTime, deployedNetworkAddress);
    }
    
    if (disputableTime !== DEFAULT_DISPUTE_TIME) {
      setCreatingNetwork(2);
      await handleChangeNetworkParameter("disputableTime", disputableTime, deployedNetworkAddress);
    }

    if (councilAmount !== DEFAULT_COUNCIL_AMOUNT) {
      setCreatingNetwork(3);
      await handleChangeNetworkParameter("councilAmount", councilAmount, deployedNetworkAddress);
    }

    if (percentageForDispute !== DEFAULT_PERCENTAGE_FOR_DISPUTE) {
      setCreatingNetwork(4);
      await handleChangeNetworkParameter("percentageNeededForDispute", percentageForDispute, deployedNetworkAddress);
    }

    if (cancelableTime !== DEFAULT_CANCELABLE_TIME) {
      setCreatingNetwork(5);
      await handleChangeNetworkParameter("cancelableTime", cancelableTime, deployedNetworkAddress);
    }

    if (oracleExchangeRate !== DEFAULT_ORACLE_EXCHANGE_RATE) {
      setCreatingNetwork(6);
      await handleChangeNetworkParameter("oracleExchangeRate", oracleExchangeRate, deployedNetworkAddress);
    }

    if (mergerFee !== DEFAULT_MERGER_FEE) {
      setCreatingNetwork(7);
      await handleChangeNetworkParameter("mergeCreatorFeeShare", mergerFee, deployedNetworkAddress);
    }

    if (proposerFee !== DEFAULT_PROPOSER_FEE) {
      setCreatingNetwork(8);
      await handleChangeNetworkParameter("proposerFeeShare", proposerFee, deployedNetworkAddress);
    }

    setCreatingNetwork(9);

    const registrationTx = await handleAddNetworkToRegistry(deployedNetworkAddress)
      .catch(error => {
        console.debug("Failed to add to registry", deployedNetworkAddress, error);

        return error;
      });

    setCreatingNetwork(10);
    cleanStorage?.();
    await processEvent("registry", "registered", payload.name.toLowerCase(), { fromBlock: registrationTx.blockNumber })
      .then(() => router.push(getURLWithNetwork("/", { network: payload.name.toLowerCase().replaceAll(" ", "-") })))
      .catch((error) => {
        checkHasNetwork();
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-create-network", {
              error,
            }),
        }));

        setCreatingNetwork(-1);
        console.debug("Failed synchronize network with web-network", deployedNetworkAddress, error);
      });
  }

  function goToMyNetworkPage() {
    router.push(getURLWithNetwork("/profile/my-network", { network: defaultNetworkName }));
  }

  function checkHasNetwork() {
    dispatch(changeLoadState(true));
    
    state.Service?.active.getNetworkAdressByCreator(state.currentUser.walletAddress)
      .then(networkAddress => setHasNetwork(networkAddress !== Defaults.nativeZeroAddress))
      .catch(console.log)
      .finally(() => dispatch(changeLoadState(false)));
  }

  

  useEffect(() => {
    if (!state.Service?.active || !state.currentUser?.walletAddress) return;

    checkHasNetwork();
  }, [state.Service?.active, state.currentUser]);

  return (
    <div>
      <style>{colorsToCSS(settings?.theme?.colors)}</style>
      <ConnectWalletButton asModal={true} />

      {
        (creatingNetwork > -1 && <CreatingNetworkLoader currentStep={creatingNetwork} steps={creationSteps} />)
      }
      
      <div>
        <Stepper dark={isSetupPage}>
          <LockBeproStep validated={tokensLocked?.validated} />

          <NetworkInformationStep validated={details?.validated} />

          <NetworkSettingsStep validated={settings?.validated} />

          <SelectRepositoriesStep validated={github?.validated} />

          <TokenConfiguration 
            validated={isSettingsValidated} 
            handleFinish={handleCreateNetwork} 
            finishLabel={t("custom-network:steps.repositories.submit-label")} 
          />
        </Stepper>
      </div>

      <AlreadyHasNetworkModal show={hasNetwork} onOkClick={goToMyNetworkPage} />
    </div>
  );
}

export function NewNetworkStepper() {
  return(
    <NetworkSettingsProvider>
      <NewNetwork></NewNetwork>
    </NetworkSettingsProvider>
  );
}
