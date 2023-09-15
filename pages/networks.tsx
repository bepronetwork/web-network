import {useState} from "react";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import PageHero from "components/common/page-hero/view";
import NetworksList from "components/networks-list";
import NotListedTokens from "components/not-listed-tokens";

import { Network } from "interfaces/network";

import { HeroInfo } from "types/components";

import { useGetHeaderNetworks, useSearchNetworks } from "x-hooks/api/network";

interface price_used {
  [name: string]: number;
}
export interface ConvertedTokens {
  [symbol: string]: price_used;
}

interface NetworksPageProps {
  header: {
    totalConverted: string;
    numberOfBounties: number;
    numberOfNetworks: number;
  };
  networks: Network[];
}

export default function NetworksPage({
  header,
  networks
}: NetworksPageProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [convertedTokens, setConvertedTokens] = useState<ConvertedTokens>();

  const infos: HeroInfo[] = [
    {
      value: header.numberOfNetworks,
      label: t("custom-network:hero.number-of-networks")
    },
    {
      value: header.numberOfBounties,
      label: t("custom-network:hero.number-of-bounties")
    },
    {
      value: header.totalConverted,
      label: t("custom-network:hero.in-the-network"),
      currency: "USD"
    }
  ];


  return (
    <>
      <div>
        <PageHero
          title={t("custom-network:hero.title")}
          subtitle={t("custom-network:hero.explanatory-text")}
          infos={infos}
        />

        <div className="mt-4">
          <NetworksList networks={networks} />
        </div>
      </div>

      <NotListedTokens 
        isVisible={isModalVisible} 
        handleClose={() => setIsModalVisible(false)} 
        networks={convertedTokens && Object.entries(convertedTokens).map(e => e[1]) || []} 
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const [header, networks] = await Promise.all([
    useGetHeaderNetworks(),
    useSearchNetworks({
      isRegistered: true,
      sortBy: "name",
      order: "asc",
      isNeedCountsAndTokensLocked: true
    })
      .then(({ rows }) => rows)
  ]);
  return {
    props: {
      header,
      networks,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "custom-network",
        "deliverable",
      ])),
    },
  };
};
