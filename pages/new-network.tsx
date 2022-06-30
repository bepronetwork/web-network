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

import { psReadAsText } from "helpers/file-reader";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

export default function NewNetwork() {
  const router = useRouter();

  const { t } = useTranslation(["common", "custom-network"]);

  const [creatingNetwork, setCreatingNetwork] = useState<number>();

  const { createNetwork } = useApi();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { user, wallet } = useAuthentication();
  const { getURLWithNetwork, colorsToCSS } = useNetworkTheme();
  const { tokensLocked, details, github, tokens, settings } = useNetworkSettings();
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

  async function handleCreateNetwork() {
    if (!user?.login || !wallet?.address || !DAOService) return;

    setCreatingNetwork(0);

    const deployNetworkTX = await handleDeployNetworkV2(tokens.settler,
                                                        tokens.bounty,
                                                        tokens.bountyURI,
                                                        settings.treasury.address.value,
                                                        settings.treasury.cancelFee.value,
                                                        settings.treasury.closeFee.value).catch(error => error);

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
      colors: JSON.stringify(settings.theme.colors),
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
      <style>{colorsToCSS(settings?.theme?.colors)}</style>
      <ConnectWalletButton asModal={true} />

      {
        (creatingNetwork !== undefined && 
        <CreatingNetworkLoader currentStep={creatingNetwork} steps={creationSteps} />) || 
        ""
      }

      <CustomContainer>
        <div className="mt-5 pt-5">
          {console.log(settings)}
          <Stepper>
            <LockBeproStep validated={tokensLocked?.validated} />

            <NetworkInformationStep validated={details?.validated} />

            <NetworkSettingsStep validated={settings?.validated} />

            <SelectRepositoriesStep validated={github?.validated} />

            <TokenConfiguration 
              validated={tokens?.validated} 
              handleFinish={handleCreateNetwork} 
              finishLabel={t("custom-network:steps.repositories.submit-label")} 
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
