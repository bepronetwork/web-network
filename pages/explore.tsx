import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ListActiveNetworks from "components/bounties/list-active-networks";
import ListRecentIssues from "components/bounties/list-recent-issues";
import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import { BountyEffectsProvider } from "contexts/bounty-effects";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

export default function ExplorePage() {
  const { t } = useTranslation(["common", "custom-network", "bounty"]);

  const [numberOfNetworks, setNumberOfNetworks] = useState(0);
  const [numberOfBounties, setNumberOfBounties] = useState(0);

  const { networkName } = useNetwork();
  const { getTotalNetworks, getTotalBounties } = useApi();

  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("custom-network:hero.number-of-networks")
    },
    {
      value: 0,
      label: t("custom-network:hero.number-of-bounties")
    }
  ]);

  const heroTitle = networkName ? 
    `${networkName.replace(/^\w/, c => c.toUpperCase())} Bounty Hall` : t("bounty:title-bounties");
  const heroSubTitle = networkName ? 
    `A collection of the most recent bounties of ${networkName} networks` : t("bounty:sub-title-bounties");

  useEffect(() => {
    getTotalNetworks(networkName)
      .then(setNumberOfNetworks)
      .catch(error => console.debug("Failed to getTotalNetworks", error));

    getTotalBounties(networkName)
      .then(setNumberOfBounties)
      .catch(error => console.debug("Failed to getTotalBounties", error));
  },[networkName])

  useEffect(() => {    
    setInfos([
      {
        value: numberOfNetworks,
        label: t("custom-network:hero.number-of-networks"),
      },
      {
        value: numberOfBounties,
        label: t("custom-network:hero.number-of-bounties"),
      }
    ]);    
  }, [numberOfNetworks, numberOfBounties]);

  return (
    <BountyEffectsProvider>
      <PageHero
        title={heroTitle}
        subtitle={heroSubTitle}
        infos={infos}
      />
      <ListActiveNetworks />
      <ListRecentIssues />
      <ListIssues variant="bounty-hall" />
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "custom-network",
        "bounty",
        "connect-wallet-button",
        "leaderboard"
      ])),
    },
  };
};
