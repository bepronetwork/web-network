import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetServerSideProps} from "next/types";

import ExplorePage from "components/pages/explore/controller";

import getExplorePageData from "x-hooks/api/get-explore-page-data";

export default ExplorePage;

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  return {
    props: {
      ...(await getExplorePageData(query)),
      ...(await serverSideTranslations(locale, ["common", "custom-network", "bounty", "connect-wallet-button"]))
    }
  };
};
