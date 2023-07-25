import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetServerSideProps} from "next/types";

import BountiesList from "components/bounty/bounties-list/controller";
import PageHero from "components/common/page-hero/view";
import CustomContainer from "components/custom-container";

import {useAppState} from "contexts/app-state";
import {BountyEffectsProvider} from "contexts/bounty-effects";

import { emptyBountiesPaginated, emptyNetworkOverview } from "helpers/api";

import { SearchBountiesPaginated } from "types/api";

import getBountiesListData from "x-hooks/api/bounty/get-bounties-list-data";
import getNetworkOverviewData from "x-hooks/api/get-overview-data";
import {useBounty} from "x-hooks/use-bounty";

interface BountiesPageProps {
  bounties: SearchBountiesPaginated;
  bountiesInProgress: number;
  bountiesClosed: number;
  lockedOnNetwork: number;
  protocolMembers: number;
}

export default function BountiesPage({
  bounties,
  bountiesInProgress,
  bountiesClosed,
  lockedOnNetwork,
  protocolMembers,
}: BountiesPageProps) {
  useBounty();
  const { t } = useTranslation(["common"]);
  
  const {state} = useAppState();

  const infos = [
    {
      value: bountiesInProgress,
      label: t("heroes.in-progress")
    },
    {
      value: bountiesClosed,
      label: t("heroes.bounties-closed")
    },
    {
      value: lockedOnNetwork,
      label: t("heroes.in-network"),
      currency: t("$oracles", { token: state.Service?.network?.active?.networkToken?.symbol || t("misc.$token") })
    },
    {
      value: protocolMembers,
      label: t("heroes.protocol-members")
    }
  ];

  return (
    <BountyEffectsProvider>
      <PageHero
        title={t("heroes.bounties.title")}
        subtitle={t("heroes.bounties.subtitle")}
        infos={infos}
      />

      <CustomContainer>
        <BountiesList
          bounties={bounties}
          variant="network"
        />
      </CustomContainer>
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const [bounties, overview] = await Promise.all([
    getBountiesListData(query)
      .then(({ data }) => data)
      .catch(() => emptyBountiesPaginated),
    getNetworkOverviewData(query)
      .then(({ data }) => data)
      .catch(() => emptyNetworkOverview)
  ]);

  const { 
    open = 0, 
    draft = 0, 
    ready = 0, 
    proposal = 0, 
    closed = 0 
  } = overview.bounties;

  return {
    props: {
      bounties,
      bountiesInProgress: open + draft + ready + proposal,
      bountiesClosed: closed,
      lockedOnNetwork: overview.curators.tokensLocked,
      protocolMembers: overview.members,
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
