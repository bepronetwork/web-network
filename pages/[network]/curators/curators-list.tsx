import {GetServerSideProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import CouncilLayout from "components/council-layout";
import CuratorsList from "components/curators-list";

export default function Curators() {
  return (
    <CouncilLayout>
      <CuratorsList />
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