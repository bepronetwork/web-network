import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";


import {useAppState} from "../../../contexts/app-state";
import {useNetwork} from "../../../x-hooks/use-network";

export default function Proposals() {
  const {t} = useTranslation(["proposal", "bounty"]);

  const {state} = useAppState();
  const { getURLWithNetwork } = useNetwork();

  return(
    <ProfileLayout>
      <span className="family-Regular h4 text-white text-capitalize">{t("label_other")}</span>

      <ListIssues
        redirect={getURLWithNetwork("/oracle")}
        buttonMessage={t('bounty:label_other')}
        proposer={state.currentUser?.walletAddress || "not-connected"}
        emptyMessage={t('errors.you-dont-have-proposals')}
      />
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "profile",
        "proposal",
        "connect-wallet-button"
      ]))
    }
  };
};
