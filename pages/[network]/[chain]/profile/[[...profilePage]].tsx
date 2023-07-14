import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProfileRouter from "components/profile/profile-router";

import { ProfilePageProps } from "types/pages";

import getProfilePageData from "x-hooks/api/get-profile-data";

export default function Profile(props: ProfilePageProps) {
  return <ProfileRouter {...props} />;
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const pageData = await getProfilePageData(query);
  
  return {
    props: {
      ...pageData,
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
