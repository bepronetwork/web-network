import React from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import Newissues from "./new-bounties";

export default function PageOracle() {
  return <Newissues />;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "oracle"]))
    }
  };
};
