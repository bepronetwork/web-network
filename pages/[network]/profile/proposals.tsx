import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ProfileLayout from "components/profile/profile-layout";

export default function Proposals() {
  
  return(
    <ProfileLayout>
      
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button"
      ]))
    }
  };
};
