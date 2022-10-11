import { useEffect } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

export default function SignIn() {
  const router = useRouter();
  
  useEffect(() => {
    if (router?.query?.error)
      router.replace(sessionStorage.getItem("lastUrlBeforeGithubConnect") || "/");
  }, [router?.query?.error]);

  return <></>;
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
