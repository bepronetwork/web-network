import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ListIssues from "components/list-issues";
import Oracle from "components/oracle";

export default function Newissues() {
  const { t } = useTranslation();

  return (
    <Oracle>
      <>
        <ListIssues
          filterState="draft"
          emptyMessage={t("bounty:errors.no-bounties-in-draft")}
        />
      </>
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
