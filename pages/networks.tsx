import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import NetworksList from "components/networks-list";
import NotListedTokens from "components/not-listed-tokens";
import PageHero, { InfosHero } from "components/page-hero";

import { useDAO } from "contexts/dao";

export interface NetworkDetails {
  totalBounties: number;
  totalSettlerLocked: number;
  tokenSymbol: string;
  tokenName: string;
  amountInCurrency: number;
  isListedInCoinGecko?: boolean;
}
interface Networks {
  [key: string]: NetworkDetails;
}

export default function NetworksPage() {
  const { t } = useTranslation(["common", "custom-network"]);

  const { service: DAOService } = useDAO();

  const [networks, setNetworks] = useState<Networks>();
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  function addNetwork(address: string, 
                      totalBounties: number, 
                      amountInCurrency: number, 
                      totalSettlerLocked: number, 
                      tokenName: string,
                      tokenSymbol: string,
                      isListedInCoinGecko = false) {
    setNetworks(prevNetworks => ({
      ...prevNetworks,
      [address]: {
        totalBounties,
        amountInCurrency,
        totalSettlerLocked,
        tokenSymbol,
        tokenName,
        isListedInCoinGecko
      }
    }));
  }

  useEffect(() => {    
    if (!networks) return;

    const networksAddresses = Object.keys(networks);
    const numberOfNetworks = networksAddresses.length;
    const totalBounties = networksAddresses.reduce((acc, el) => acc + networks[el].totalBounties, 0);
    const amountInNetworks = networksAddresses.reduce((acc, el) => acc + networks[el].amountInCurrency, 0);

    setInfos([
      {
        value: numberOfNetworks,
        label: t("custom-network:hero.number-of-networks")
      },
      {
        value: totalBounties,
        label: t("custom-network:hero.number-of-bounties")
      },
      {
        value: amountInNetworks,
        label: t("custom-network:hero.in-the-network"),
        currency: "USD",
        hasNotConvertedTokens: !!Object.entries(networks).find(network => !network[1].isListedInCoinGecko),
        setNotListedModalVisibility: () => setIsModalVisible(true)
      }
    ]);    
  }, [networks]);

  useEffect(() => {
    if (DAOService) DAOService.loadRegistry();
  }, [DAOService]);

  return (
    <>
      <div>
        <PageHero
          title={t("custom-network:hero.title")}
          subtitle={t("custom-network:hero.explanatory-text")}
          infos={infos}
        />

        <div className="mt-3">
          <NetworksList addNetwork={addNetwork} redirectToHome />
        </div>
      </div>

      <NotListedTokens 
        isVisible={isModalVisible} 
        handleClose={() => setIsModalVisible(false)} 
        networks={networks && Object.entries(networks).map(e => e[1]) || []} 
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "custom-network", "pull-request"]))
    }
  };
};
