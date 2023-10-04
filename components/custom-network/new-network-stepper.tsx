import {useEffect, useState} from "react";

import {TransactionReceipt} from "@taikai/dappkit/dist/src/interfaces/web3-core";
import {isZeroAddress} from "ethereumjs-util";
import { useSession } from "next-auth/react";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import ConnectWalletButton from "components/connect-wallet-button";
import {ContextualSpan} from "components/contextual-span";
import CreatingNetworkLoader from "components/creating-network-loader";
import LockBeproStep from "components/custom-network/lock-bepro-step";
import NetworkInformationStep from "components/custom-network/network-information-step";
import NetworkSettingsStep from "components/custom-network/network-settings-step";
import TokenConfiguration from "components/custom-network/token-configuration";
import If from "components/If";
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
  DEFAULT_PROPOSER_FEE,
  UNSUPPORTED_CHAIN,
  WANT_TO_CREATE_NETWORK
} from "helpers/constants";
import {psReadAsText} from "helpers/file-reader";

import {RegistryEvents, StandAloneEvents} from "interfaces/enums/events";

import useCreateNetwork from "x-hooks/api/network/use-create-network";
import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useNetwork} from "x-hooks/use-network";
import useNetworkTheme from "x-hooks/use-network-theme";
import useSignature from "x-hooks/use-signature";

function NewNetwork() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { t } = useTranslation(["common", "custom-network"]);

  const [hasNetwork, setHasNetwork] = useState(false);
  const [creatingNetwork, setCreatingNetwork] = useState<number>(-1);

  const { state, dispatch } = useAppState();

  const { signMessage } = useSignature();
  const { colorsToCSS } = useNetworkTheme();
  const { getURLWithNetwork } = useNetwork();
  const { processEvent } = useApi();
  const { handleDeployNetworkV2, handleAddNetworkToRegistry, handleChangeNetworkParameter } = useBepro();
  const { tokensLocked, details, tokens, settings, isSettingsValidated, cleanStorage } = useNetworkSettings();

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
    { id: 3, name: t("custom-network:modals.loader.steps.sync-web-network") },
    { id: 3, name: t("custom-network:modals.loader.steps.sync-chain-id") }
  ];

  async function handleCreateNetwork() {
    if (!state.currentUser?.walletAddress || !state.Service?.active) return;

    const signedMessage = await signMessage(WANT_TO_CREATE_NETWORK);

    if (!signedMessage)
      return;

    setCreatingNetwork(0);

    const deployNetworkTX = await handleDeployNetworkV2(tokens.settler).catch(error => {
      console.debug("Failed to deploy network", error);
      return error;
    });

    if (!deployNetworkTX?.contractAddress) return setCreatingNetwork(-1);

    const deployedNetworkAddress = deployNetworkTX.contractAddress;

    const payload = {
      name: details.name.value,
      description: details.description,
      colors: settings.theme.colors,
      logoIcon: (await psReadAsText(details.iconLogo.value.raw)).toString(),
      fullLogo: (await psReadAsText(details.fullLogo.value.raw)).toString(),
      creator: state.currentUser.walletAddress,
      tokens,
      networkAddress: deployedNetworkAddress,
      signedMessage
    };

    const networkCreated = await useCreateNetwork(payload)
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

    const getTxBlock = (tx: TransactionReceipt) => tx.blockNumber;
    const txBlocks = [];

    if (draftTime !== DEFAULT_DRAFT_TIME) {
      setCreatingNetwork(1);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("draftTime", draftTime, deployedNetworkAddress)));
    }

    if (disputableTime !== DEFAULT_DISPUTE_TIME) {
      setCreatingNetwork(2);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("disputableTime", 
                                                                  disputableTime,
                                                                  deployedNetworkAddress)));
    }

    if (councilAmount !== DEFAULT_COUNCIL_AMOUNT) {
      setCreatingNetwork(3);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("councilAmount", 
                                                                  councilAmount, 
                                                                  deployedNetworkAddress)));
    }

    if (percentageForDispute !== DEFAULT_PERCENTAGE_FOR_DISPUTE) {
      setCreatingNetwork(4);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("percentageNeededForDispute", 
                                                                  percentageForDispute, 
                                                                  deployedNetworkAddress)));
    }

    if (cancelableTime !== DEFAULT_CANCELABLE_TIME) {
      setCreatingNetwork(5);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("cancelableTime", 
                                                                  cancelableTime, 
                                                                  deployedNetworkAddress)));
    }

    if (oracleExchangeRate !== DEFAULT_ORACLE_EXCHANGE_RATE) {
      setCreatingNetwork(6);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("oracleExchangeRate", 
                                                                  oracleExchangeRate, 
                                                                  deployedNetworkAddress)));
    }

    if (mergerFee !== DEFAULT_MERGER_FEE) {
      setCreatingNetwork(7);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("mergeCreatorFeeShare", 
                                                                  mergerFee, 
                                                                  deployedNetworkAddress)));
    }

    if (proposerFee !== DEFAULT_PROPOSER_FEE) {
      setCreatingNetwork(8);
      txBlocks.push(getTxBlock(await handleChangeNetworkParameter("proposerFeeShare", 
                                                                  proposerFee, 
                                                                  deployedNetworkAddress)));
    }

    if (txBlocks.length)
      await processEvent(StandAloneEvents.UpdateNetworkParams, deployedNetworkAddress, {
        chainId: state.connectedChain?.id,
        fromBlock: Math.min(...txBlocks)
      })
        .catch(error => console.debug("Failed to update network parameters", error));

    setCreatingNetwork(9);

    const registrationTx = await handleAddNetworkToRegistry(deployedNetworkAddress)
      .catch(error => {
        console.debug("Failed to add to registry", deployedNetworkAddress, error);

        return error;
      });

    setCreatingNetwork(10);
    cleanStorage?.();
    await processEvent(RegistryEvents.NetworkRegistered, state.connectedChain?.registry, {
      fromBlock: registrationTx.blockNumber
    })
      .then(() => {
        updateSession();
        router.push(getURLWithNetwork("/", {
          network: payload.name,
          chain: state.connectedChain?.shortName
        }));
      })
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

  function checkHasNetwork() {
    dispatch(changeLoadState(true));

    state.Service?.active.getNetworkAdressByCreator(state.currentUser.walletAddress)
      .then(networkAddress => setHasNetwork(!isZeroAddress(networkAddress)))
      .catch(console.debug)
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    const walletAddress = state.currentUser?.walletAddress;
    const connectedChain = state.connectedChain;

    if (!state.Service?.active ||
        !walletAddress ||
        !connectedChain ||
        connectedChain?.name === UNSUPPORTED_CHAIN) return;

    checkHasNetwork();
  }, [state.Service?.active, state.currentUser, state.connectedChain]);

  return (
    <div>
      <style>{colorsToCSS(settings?.theme?.colors)}</style>
      <ConnectWalletButton asModal={true} />

      <If condition={creatingNetwork > -1}>
        <CreatingNetworkLoader currentStep={creatingNetwork} steps={creationSteps} />
      </If>

      <If condition={hasNetwork}>
        <div className="d-flex flex-col align-items-center justify-content-center mb-3">
          <ContextualSpan context="info" children={t("modals.already-has-network.content")} />
        </div>
      </If>

      <Stepper dark={isSetupPage}>
        <LockBeproStep validated={tokensLocked?.validated} />

        <NetworkInformationStep validated={details?.validated} />

        <NetworkSettingsStep validated={settings?.validated} />

        <TokenConfiguration
          validated={isSettingsValidated}
          handleFinish={handleCreateNetwork}
          finishLabel={t("custom-network:steps.repositories.submit-label")}
        />
      </Stepper>
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
