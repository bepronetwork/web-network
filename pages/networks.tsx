import {createContext, useEffect, useState} from "react";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import NetworksList from "components/networks-list";
import NotListedTokens from "components/not-listed-tokens";
import PageHero, {InfosHero} from "components/page-hero";

interface price_used {
  [name: string]: number;
}
export interface ConvertedTokens {
  [symbol: string]: price_used;
}

interface NetworksPageProps {
  numberOfNetworks: number;
  numberOfBounties: number;
  totalConverted: string;
  convertedTokens?: ConvertedTokens;
  setNumberOfNetworks: (quantity: number) => void;
  setNumberOfBounties: (quantity: number) => void;
  setTotalConverted: (amount: string) => void;
  setConvertedTokens: (tokens: ConvertedTokens) => void;
}

export const NetworksPageContext = createContext<NetworksPageProps>({
  numberOfNetworks: 0,
  numberOfBounties: 0,
  totalConverted: "0",
  setNumberOfNetworks: (quantity: number) => console.log("incrementNumberOfNetworks", quantity),
  setNumberOfBounties: (quantity: number) => console.log("incrementNumberOfBounties", quantity),
  setTotalConverted: (amount: string) => console.log("incrementTotalConverted", amount),
  setConvertedTokens: (tokens: ConvertedTokens) => console.log("includeNotConvertedToken", tokens)
});

export default function NetworksPage() {
  const { t } = useTranslation(["common", "custom-network"]);

  const [totalConverted, setTotalConverted] = useState("");
  const [numberOfNetworks, setNumberOfNetworks] = useState(0);
  const [numberOfBounties, setNumberOfBounties] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [convertedTokens, setConvertedTokens] = useState<ConvertedTokens>();

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
      value: "0",
      label: t("custom-network:hero.in-the-network"),
      currency: "USD"
    }
  ]);

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
        value: +totalConverted,
        label: t("custom-network:hero.in-the-network"),
        currency: "USD",
        hasConvertedTokens: !!convertedTokens,
        setListedModalVisibility: () => setIsModalVisible(true)
      }
    ]);    
  }, [numberOfNetworks, numberOfBounties, totalConverted, convertedTokens]);

  const contextValue = {
    totalConverted,
    numberOfNetworks,
    numberOfBounties,
    convertedTokens,
    setNumberOfNetworks,
    setNumberOfBounties,
    setTotalConverted,
    setConvertedTokens
  }

  return (
    <NetworksPageContext.Provider value={contextValue}>
      <div>
        <PageHero
          title={t("custom-network:hero.title")}
          subtitle={t("custom-network:hero.explanatory-text")}
          infos={infos}
        />

        <div className="mt-4">
          <NetworksList />
        </div>
      </div>

      <NotListedTokens 
        isVisible={isModalVisible} 
        handleClose={() => setIsModalVisible(false)} 
        networks={convertedTokens && Object.entries(convertedTokens).map(e => e[1]) || []} 
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
