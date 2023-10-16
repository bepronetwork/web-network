import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";

import ProfileRouter from "components/profile/profile-router";

import { ProfilePageProps } from "types/pages";

import { useGetChains } from "x-hooks/api/chain";
import { useGetProfileBounties, useGetProfilePayments } from "x-hooks/api/pages/profile";

const { serverRuntimeConfig: { auth: { secret } } } = getConfig();

export default function Profile(props: ProfilePageProps) {
  return <ProfileRouter {...props} />;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query, locale }) => {
  const token = await getToken({ req, secret: secret });
  const { profilePage } = query || {};
  const [pageName] = (profilePage || ["profile"]);
  const queryWithWallet = {
    ...query,
    wallet: token?.address as string
  };

  const bountiesResult = result => ({ bounties: result });

  const getDataFn = {
    payments: () => useGetProfilePayments(queryWithWallet),
    wallet: () => useGetChains().then(chains => ({ chains })).catch(() => ({ chains: [] })),
    bounties: () => useGetProfileBounties(queryWithWallet, "creator").then(bountiesResult),
    proposals: () => useGetProfileBounties(queryWithWallet, "proposer").then(bountiesResult),
    "deliverables": () => useGetProfileBounties(queryWithWallet, "deliverabler").then(bountiesResult),
    "my-network": () => useGetProfileBounties(query, "governor").then(bountiesResult),
  };

  const pageData = getDataFn[pageName] ? await getDataFn[pageName]() : {};
  
  return {
    props: {
      ...pageData,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "my-oracles",
        "connect-wallet-button",
        "profile",
        "deliverable",
        "custom-network",
        "setup",
        "change-token-modal",
        "proposal"
      ]))
    }
  };
};
