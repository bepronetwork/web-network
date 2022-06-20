import React, { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router from "next/router";

import NetworksStep from "components/administration/networks-step";
import ConnectWalletButton from "components/connect-wallet-button";
import Stepper from "components/stepper";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

export default function ParityPage() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();

  const {searchNetworks} = useApi();


  function handleChangeStep(stepToGo) {
    setCurrentStep(stepToGo === currentStep ? 0 : stepToGo);
  }

  useEffect(() => {
    if (!wallet?.address) return;

    DAOService.isRegistryGovernor(wallet.address).then(isGovernor => {
      if (!isGovernor) 
        router.push("/networks");
      else
        searchNetworks({})
          .then(({ count, rows }) => {
            if (count > 0) setNetworks(rows);
          })
          .catch((error) => {
            console.log("Failed to retrieve networks list", error);
          });
    }).catch(error => console.log("Failed to verify governor", error));
  }, [wallet?.address]);

  return (
    <div className="container mb-5 pt-5">
      <ConnectWalletButton asModal={true} />
      <br />
      <br />

      <Stepper>
        <NetworksStep step={1} currentStep={currentStep} networks={networks} handleChangeStep={handleChangeStep} />
      </Stepper>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "connect-wallet-button",
        "parity",
        "custom-network"
      ]))
    }
  };
};
