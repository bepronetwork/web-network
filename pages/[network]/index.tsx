import React from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetServerSideProps} from "next/types";

import ExplorePage from "pages/explore";

export default function NetworkBountyHall() {
  return <ExplorePage/>;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "custom-network",
        "leaderboard",
      ])),
    },
  };
};