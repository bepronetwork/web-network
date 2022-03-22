import React from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Account from "components/account";
import ListIssues from "components/list-issues";

import { useAuthentication } from "contexts/authentication";

export default function MyPullRequests() {
  const { user } = useAuthentication();

  const { t } = useTranslation(["pull-request", "bounty"]);

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <ListIssues
            redirect="/developers"
            buttonMessage={t("bounty:label_other")}
            pullRequester={user?.login || "not-connected"}
            emptyMessage={String(t("errors.you-dont-have-pull-requests"))}
          />
        </div>
      </div>
    </Account>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "pull-request",
        "custom-network"
      ]))
    }
  };
};
