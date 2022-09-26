import React from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ReadyToPropose from "./ready-to-propose";


export default function PageCouncil() {
  return <ReadyToPropose />
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
        ...(await serverSideTranslations(locale, ["common", "bounty", "council", "connect-wallet-button"]))
    }
  };
};
