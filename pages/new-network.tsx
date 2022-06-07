import { useContext, useEffect, useState } from "react";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import { useRouter } from "next/router";

import ConnectWalletButton from "components/connect-wallet-button";
import CreatingNetworkLoader from "components/creating-network-loader";
import CustomContainer from "components/custom-container";
import LockBeproStep from "components/custom-network/lock-bepro-step";
import NetworkInformationStep from "components/custom-network/network-information-step";
import SelectRepositoriesStep from "components/custom-network/select-repositories-step";
import TokenConfiguration from "components/custom-network/token-configuration";
import TreasuryStep from "components/custom-network/treasury-step";
import Stepper from "components/stepper";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast } from "contexts/reducers/add-toast";

import { psReadAsText } from "helpers/file-reader";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

export default function NewNetwork() {
  const router = useRouter();

  const { t } = useTranslation(["common", "custom-network"]);

  const [currentStep, setCurrentStep] = useState(1);
  const [creatingNetwork, setCreatingNetwork] = useState<number>();

  const { createNetwork } = useApi();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { user, wallet } = useAuthentication();
  const { getURLWithNetwork, colorsToCSS } = useNetworkTheme();
  const { tokensLocked, details, github, tokens, treasury } = useNetworkSettings();
  const { handleDeployNetworkV2, handleSetDispatcher, handleAddNetworkToRegistry } = useBepro();

  const { dispatch } = useContext(ApplicationContext);

  const creationSteps = [
    {
      id: 1,
      name: t("custom-network:modals.loader.steps.deploy-network"),
    },
    {
      id: 2,
      name: t("custom-network:modals.loader.steps.set-dispatcher")
    },
    {
      id: 3,
      name: t("custom-network:modals.loader.steps.add-to-registry"),
    },
    {
      id: 4,
      name: t("custom-network:modals.loader.steps.sync-web-network")
    },
  ];

  function handleChangeStep(stepToGo: number) {
    const stepsNames = {
      1: tokensLocked,
      2: details,
      3: github,
      4: tokens,
      5: treasury
    };

    let canGo = false;

    if (stepToGo !== currentStep) {
      if (stepToGo < currentStep) canGo = true;
      else if (stepsNames[stepToGo - 1].validated) canGo = true;
    }

    if (canGo) setCurrentStep(stepToGo);
  }

  async function handleCreateNetwork() {
    if (!user?.login || !wallet?.address || !DAOService) return;

    setCreatingNetwork(0);

    const deployNetworkTX = await handleDeployNetworkV2(tokens.settler,
                                                        tokens.bounty,
                                                        tokens.bountyURI,
                                                        treasury.address.value,
                                                        treasury.cancelFee,
                                                        treasury.closeFee).catch(error => error);

    if (!(deployNetworkTX as TransactionReceipt)?.contractAddress) return setCreatingNetwork(undefined);

    const deployedNetworkAddress = (deployNetworkTX as TransactionReceipt).contractAddress;

    setCreatingNetwork(1);

    await handleSetDispatcher(tokens.bounty, deployedNetworkAddress)
      .catch(error => console.error("Failed to set dispatcher", deployedNetworkAddress, error));

    setCreatingNetwork(2);

    await handleAddNetworkToRegistry(deployedNetworkAddress)
      .catch(error => console.error("Failed to add to registry", deployedNetworkAddress, error));

    setCreatingNetwork(3);

    const payload = {
      name: details.name.value,
      description: details.description,
      colors: JSON.stringify(details.theme.colors),
      logoIcon: await psReadAsText(details.iconLogo.value.raw),
      fullLogo: await psReadAsText(details.fullLogo.value.raw),
      repositories: 
        JSON.stringify(github.repositories
          .filter((repo) => repo.checked)
          .map(({ name, fullName }) => ({ name, fullName }))),
      botPermission: github.botPermission,
      creator: wallet.address,
      githubLogin: user.login,
      networkAddress: deployedNetworkAddress,
      accessToken: user.accessToken
    };

    await createNetwork(payload)
      .then(() => {
        router.push(getURLWithNetwork("/account/my-network/settings", { network: payload.name }));

        setCreatingNetwork(undefined);
      })
      .catch((error) => {
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-create-network", {
              error,
            }),
        }));

        setCreatingNetwork(undefined);
        console.error("Failed synchronize network with web-network", deployedNetworkAddress, error);
      });
  }

  useEffect(() => {
    if (!activeNetwork) return;

    if (activeNetwork.name.toLowerCase() !== publicRuntimeConfig?.networkConfig?.networkName.toLowerCase())
      router.push(getURLWithNetwork("/account", { network: publicRuntimeConfig?.networkConfig?.networkName }));
  }, [activeNetwork]);

  return (
    <div className="new-network">
      <style>{colorsToCSS(details?.theme?.colors)}</style>
      <ConnectWalletButton asModal={true} />

      {
        (creatingNetwork !== undefined && 
        <CreatingNetworkLoader currentStep={creatingNetwork} steps={creationSteps} />) || 
        ""
      }

      <CustomContainer>
        <div className="mt-5 pt-5">
          <Stepper>
            <LockBeproStep
              step={1}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <NetworkInformationStep
              step={2}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <SelectRepositoriesStep
              step={3}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <TokenConfiguration
              step={4}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <TreasuryStep
              step={5}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
              handleFinish={handleCreateNetwork}
            />
          </Stepper>
        </div>
      </CustomContainer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "custom-network",
        "connect-wallet-button",
        "change-token-modal"
      ])),
    },
  };
};
