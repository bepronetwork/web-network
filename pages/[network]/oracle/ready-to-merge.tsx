import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ListIssues from "components/list-issues";
import Oracle from "components/oracle";

export default function ReadyToMergeIssues() {
  const { t } = useTranslation(["common", "bounty"]);

  return (
    <Oracle>
      <ListIssues
        filterState="ready"
        emptyMessage={t("bounty:errors.no-bounties-to-merge")}
      />
    </Oracle>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "oracle"]))
    }
  };
};
