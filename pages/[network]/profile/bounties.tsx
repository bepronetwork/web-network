import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";

import { useAuthentication } from "contexts/authentication";

export default function Bounties() {
  const { t } = useTranslation("bounty");

  const { user } = useAuthentication();

  return(
    <ProfileLayout>
      <span className="family-Regular h4 text-white text-capitalize">{t("label_other")}</span>

      <ListIssues creator={user?.login || "not-connected"} />
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
        "pull-request",
        "connect-wallet-button"
      ]))
    }
  };
};
