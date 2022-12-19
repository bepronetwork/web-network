import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import CouncilLayout from "components/council-layout";
import ListIssues from "components/list-issues";

export default function ReadyToPropose() {
  const {t} = useTranslation(["council"]);

  return (
    <CouncilLayout>
      <ListIssues 
        filterState="proposal" 
        emptyMessage={t("council:empty")}
        disputableFilter="merge"
      />
    </CouncilLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "council", "connect-wallet-button"]))
    }
  };
};
