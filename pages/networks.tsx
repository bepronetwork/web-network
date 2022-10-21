import {createContext, useContext, useEffect, useState} from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import NetworksList from "components/networks-list";
import NotListedTokens from "components/not-listed-tokens";
import PageHero, { InfosHero } from "components/page-hero";

import {AppStateContext} from "../contexts/app-state";

interface NetworkTokenLocked {
  name: string;
  symbol: string;
  totalSettlerLocked: number;
}

interface NotConvertedTokens {
  [address: string]: NetworkTokenLocked;
}

interface NetworksPageProps {
  numberOfNetworks: number;
  numberOfBounties: number;
  totalConverted: number;
  notConvertedTokens?: NotConvertedTokens;
  setNumberOfNetworks: (quantity: number) => void;
  setNumberOfBounties: (quantity: number) => void;
  setTotalConverted: (amount: number) => void;
  setNotConvertedTokens: (tokens: NotConvertedTokens) => void;
}

export const NetworksPageContext = createContext<NetworksPageProps>({
  numberOfNetworks: 0,
  numberOfBounties: 0,
  totalConverted: 0,
  setNumberOfNetworks: (quantity: number) => console.log("incrementNumberOfNetworks", quantity),
  setNumberOfBounties: (quantity: number) => console.log("incrementNumberOfBounties", quantity),
  setTotalConverted: (amount: number) => console.log("incrementTotalConverted", amount),
  setNotConvertedTokens: (tokens: NotConvertedTokens) => console.log("includeNotConvertedToken", tokens)
});

export default function NetworksPage() {
  const { t } = useTranslation(["common", "custom-network"]);

  const {state} = useContext(AppStateContext);

  const [totalConverted, setTotalConverted] = useState(0);
  const [numberOfNetworks, setNumberOfNetworks] = useState(0);
  const [numberOfBounties, setNumberOfBounties] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notConvertedTokens, setNotConvertedTokens] = useState<NotConvertedTokens>();

  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("custom-network:hero.number-of-networks")
    },
    {
      value: 0,
      label: t("custom-network:hero.number-of-bounties")
    },
    {
      value: 0,
      label: t("custom-network:hero.in-the-network"),
      currency: "USD"
    }
  ]);

  useEffect(() => {
    if (state.Service?.active) state.Service?.active.loadRegistry();
  }, [state.Service?.active]);

  useEffect(() => {    
    setInfos([
      {
        value: numberOfNetworks,
        label: t("custom-network:hero.number-of-networks")
      },
      {
        value: numberOfBounties,
        label: t("custom-network:hero.number-of-bounties")
      },
      {
        value: totalConverted,
        label: t("custom-network:hero.in-the-network"),
        currency: "USD",
        hasNotConvertedTokens: !!notConvertedTokens,
        setNotListedModalVisibility: () => setIsModalVisible(true)
      }
    ]);    
  }, [numberOfNetworks, numberOfBounties, totalConverted, notConvertedTokens]);

  const contextValue = {
    totalConverted,
    numberOfNetworks,
    numberOfBounties,
    notConvertedTokens,
    setNumberOfNetworks,
    setNumberOfBounties,
    setTotalConverted,
    setNotConvertedTokens
  }

  return (
    <NetworksPageContext.Provider value={contextValue}>
      <div>
        <PageHero
          title={t("custom-network:hero.title")}
          subtitle={t("custom-network:hero.explanatory-text")}
          infos={infos}
        />

        <div className="mt-3">
          <NetworksList />
        </div>
      </div>

      <NotListedTokens 
        isVisible={isModalVisible} 
        handleClose={() => setIsModalVisible(false)} 
        networks={notConvertedTokens && Object.entries(notConvertedTokens).map(e => e[1]) || []} 
      />
    </NetworksPageContext.Provider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "custom-network",
        "pull-request",
      ])),
    },
  };
};
