import { useContext, useEffect, useState } from "react";

import { Defaults } from "@taikai/dappkit";
import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import AlreadyHasNetworkModal from "components/already-has-network-modal";
import ConnectWalletButton from "components/connect-wallet-button";
import CreatingNetworkLoader from "components/creating-network-loader";
import CustomContainer from "components/custom-container";
import LockBeproStep from "components/custom-network/lock-bepro-step";
import NetworkInformationStep from "components/custom-network/network-information-step";
import NetworkSettingsStep from "components/custom-network/network-settings-step";
import SelectRepositoriesStep from "components/custom-network/select-repositories-step";
import TokenConfiguration from "components/custom-network/token-configuration";
import Stepper from "components/stepper";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast } from "contexts/reducers/add-toast";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { useSettings } from "contexts/settings";

import { 
  DEFAULT_COUNCIL_AMOUNT, 
  DEFAULT_DISPUTE_TIME, 
  DEFAULT_DRAFT_TIME, 
  DEFAULT_PERCENTAGE_FOR_DISPUTE 
} from "helpers/contants";
import { psReadAsText } from "helpers/file-reader";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

export default function NewNetwork() {
  const router = useRouter();

  const { t } = useTranslation(["common", "custom-network"]);

  const [creatingNetwork, setCreatingNetwork] = useState<number>(-1);
  const [hasNetwork, setHasNetwork] = useState(false);

  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { user, wallet } = useAuthentication();
  const { settings: appSettings } = useSettings(); 
  const { createNetwork, registerNetwork } = useApi();
  const { handleChangeNetworkParameter } = useBepro();
  const { getURLWithNetwork, colorsToCSS } = useNetworkTheme();
  const { tokensLocked, details, github, tokens, settings } = useNetworkSettings();
  const { handleDeployNetworkV2, handleAddNetworkToRegistry } = useBepro();

  const { dispatch } = useContext(ApplicationContext);

  const defaultNetworkName = appSettings?.defaultNetworkConfig?.name?.toLowerCase() || "bepro";
  const isFormValidates = [
    tokensLocked?.validated,
    details?.validated,
    settings?.validated,
    github?.validated,
    tokens?.validated,
  ].every(condition=>condition)
    
  const creationSteps = [
    { id: 1, name: t("custom-network:modals.loader.steps.deploy-network") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-draft-time") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-disputable-time") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-dispute-percentage") },
    { id: 1, name: t("custom-network:modals.loader.steps.changing-council-amount") },
    { id: 2, name: t("custom-network:modals.loader.steps.add-to-registry") },
    { id: 3, name: t("custom-network:modals.loader.steps.sync-web-network") }
  ];

  async function handleCreateNetwork() {
    if (!user?.login || !wallet?.address || !DAOService) return;
    setCreatingNetwork(0);

    const payload = {
      name: details.name.value,
      description: details.description,
      colors: JSON.stringify(settings.theme.colors),
      logoIcon: await psReadAsText(details.iconLogo.value.raw),
      fullLogo: await psReadAsText(details.fullLogo.value.raw),
      repositories: 
        JSON.stringify(github.repositories
          .filter((repo) => repo.checked)
          .map(({ name, fullName }) => ({ name, fullName }))),
      botPermission: github.botPermission,
      creator: wallet.address,
      accessToken: user.accessToken,
      githubLogin: user.login
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

    

    const deployNetworkTX = await handleDeployNetworkV2(tokens.settler).catch(error => error);

    if (!(deployNetworkTX as TransactionReceipt)?.contractAddress) return setCreatingNetwork(-1);

    const deployedNetworkAddress = (deployNetworkTX as TransactionReceipt).contractAddress;

    const draftTime = settings.parameters.draftTime.value;
    const disputableTime = settings.parameters.disputableTime.value;
    const councilAmount = settings.parameters.councilAmount.value;
    const percentageForDispute = settings.parameters.percentageNeededForDispute.value;

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

    setCreatingNetwork(5);

    await handleAddNetworkToRegistry(deployedNetworkAddress)
      .catch(error => console.error("Failed to add to registry", deployedNetworkAddress, error));

    setCreatingNetwork(6);

    await registerNetwork({
      creator: payload.creator
    })
      .then(() => {
        router.push(getURLWithNetwork("/", { network: payload.name }));
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
        console.error("Failed synchronize network with web-network", deployedNetworkAddress, error);
      });
  }

  function goToMyNetworkPage() {
    router.push(getURLWithNetwork("/profile/my-network", { network: defaultNetworkName }));
  }

  function checkHasNetwork() {
    dispatch(changeLoadState(true));

    DAOService.getNetworkAdressByCreator(wallet.address)
      .then(networkAddress => setHasNetwork(networkAddress !== Defaults.nativeZeroAddress))
      .catch(console.log)
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!activeNetwork) return;

    if (activeNetwork.name.toLowerCase() !== defaultNetworkName)
      router.push(getURLWithNetwork("/account", { network: defaultNetworkName }));
  }, [activeNetwork]);

  useEffect(() => {
    if (!DAOService || !wallet?.address) return;

    checkHasNetwork();
  }, [DAOService, wallet]);

  return (
    <div>
      <style>{colorsToCSS(settings?.theme?.colors)}</style>
      <ConnectWalletButton asModal={true} />

      {
        (creatingNetwork > -1 && <CreatingNetworkLoader currentStep={creatingNetwork} steps={creationSteps} />)
      }
      <CustomContainer>
        <div className="mt-5">
          <Stepper>
            <LockBeproStep validated={tokensLocked?.validated} />

            <NetworkInformationStep validated={details?.validated} />

            <NetworkSettingsStep validated={settings?.validated} />

            <SelectRepositoriesStep validated={github?.validated} />

            <TokenConfiguration 
              validated={isFormValidates} 
              handleFinish={handleCreateNetwork} 
              finishLabel={t("custom-network:steps.repositories.submit-label")} 
            />
          </Stepper>
        </div>
      </CustomContainer>

      <AlreadyHasNetworkModal show={hasNetwork} onOkClick={goToMyNetworkPage} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "custom-network",
        "connect-wallet-button",
        "change-token-modal"
      ])),
    },
  };
};
