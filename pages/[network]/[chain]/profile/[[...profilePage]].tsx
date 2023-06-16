import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProfileRouter from "components/profile/profile-router";

import { SearchBountiesPaginated } from "types/api";

import getBountiesListData from "x-hooks/api/get-bounties-list-data";

interface ProfilePageProps {
  bounties: SearchBountiesPaginated;
}

export default function Profile({
  bounties
}: ProfilePageProps) {
  return <ProfileRouter bounties={bounties} />;
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const hasNotWalletFilter = !query?.creator && !query?.proposer && !query?.pullRequester;
  const emptyData = { count: 0, rows: [], currentPage: 1, pages: 1 };

  const bounties = hasNotWalletFilter ? emptyData : await getBountiesListData(query)
    .then(({ data }) => data)
    .catch(() => ({ count: 0, rows: [], currentPage: 1, pages: 1 }));

  return {
    props: {
      bounties,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "my-oracles",
        "connect-wallet-button",
        "profile",
        "pull-request",
        "custom-network",
        "setup",
        "change-token-modal",
        "proposal"
      ]))
    }
  };
};
