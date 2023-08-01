import { useTranslation } from "next-i18next";

import ListActiveNetworks from "components/bounties/list-active-networks";
import ListRecentIssues from "components/bounties/list-recent-issues";
import BountiesList from "components/bounty/bounties-list/controller";
import PageHero from "components/common/page-hero/view";
import CustomContainer from "components/custom-container";

import { ExplorePageProps } from "types/pages";

interface ExplorePageViewProps extends ExplorePageProps {
  networkName?: string;
}

export default function ExplorePageView({
  numberOfNetworks,
  bounties,
  recentBounties,
  recentFunding,
  networkName,
}: ExplorePageViewProps) {
  const { t } = useTranslation(["common", "custom-network", "bounty"]);

  const infos = [
    {
      value: numberOfNetworks,
      label: t("custom-network:hero.number-of-networks")
    },
    {
      value: bounties?.totalBounties || 0,
      label: t("custom-network:hero.number-of-bounties")
    }
  ];

  const heroTitle = networkName ? 
    t("custom-network:network-bounty-hall.title", { network: networkName }) : 
    t("bounty:title-bounties");

  const heroSubTitle = networkName ? 
    t("custom-network:network-bounty-hall.description", { network: networkName }) : 
    t("bounty:sub-title-bounties");

  return (
    <>
      <PageHero
        title={heroTitle}
        subtitle={heroSubTitle}
        infos={infos}
      />

      <ListActiveNetworks />

      <ListRecentIssues
        recentBounties={recentBounties}
      />

      <ListRecentIssues
        type="funding"
        recentBounties={recentFunding}
      />

      <CustomContainer className="mt-3 px-xl-0">
        <BountiesList 
          bounties={bounties}
          variant="bounty-hall"
        />
      </CustomContainer>
    </>
  );
}