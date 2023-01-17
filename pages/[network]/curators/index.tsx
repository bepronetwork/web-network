import React from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import CouncilLayout from "components/council-layout";
import CuratorsList from "components/curators-list";
import ListIssues from "components/list-issues";

export default function PageCouncil() {
  const { t } = useTranslation(["council"]);
  const router = useRouter();
  const { type } = router.query;

  const types = {
    "curators-list": <CuratorsList key={"curators-list"} />,
    "ready-to-close": (
      <ListIssues
        key={"ready-to-close"}
        filterState="proposal"
        emptyMessage={t("council:empty")}
        disputableFilter="merge"
      />
    ),
    "ready-to-dispute": (
      <ListIssues
        key={"ready-to-dispute"}
        filterState="proposal"
        emptyMessage={t("council:empty")}
        disputableFilter="dispute"
      />
    ),
    "ready-to-propose": (
      <ListIssues
        key={"ready-to-propose"}
        filterState="ready"
        emptyMessage={t("council:empty")}
      />
    ),
  };

  return (
    <CouncilLayout>
      {types[type.toString()]
        ? types[type.toString()]
        : types["ready-to-propose"]}
    </CouncilLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "council",
        "connect-wallet-button",
      ])),
    },
  };
};
