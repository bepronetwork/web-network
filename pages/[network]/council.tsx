import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CardBecomeCouncil from "components/card-become-council";
import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import { useAuthentication } from "contexts/authentication";

import useApi from "x-hooks/use-api";

export default function PageCouncil() {
  const { t } = useTranslation(["council"]);
  const { wallet } = useAuthentication();
  const { getTotalBounties } = useApi();

  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("council:ready-bountys")
    },
    {
      value: 0,
      label: t("council:council-members")
    },
    {
      value: 0,
      label: t("council:distributed-developers"),
      currency: "BEPRO"
    }
  ]);

  async function loadTotals() {
    const [totalBounties] = await Promise.all([
      getTotalBounties('ready'),
    ]);
    
    setInfos([
      {
        value: totalBounties,
        label: t("council:ready-bountys")
      },
      {
        value: 0,
        label: t("council:council-members")
      },
      {
        value: 0,
        label: t("council:distributed-developers"),
        currency: "BEPRO"
      }
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, []);


  return (
    <div>
      <PageHero
        title={t("council:title")}
        subtitle={t("council:subtitle")}
        infos={infos}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 mt-2">
            {!wallet?.isCouncil && <CardBecomeCouncil />}
          </div>
        </div>
      </div>
      <ListIssues filterState="ready" emptyMessage={t("council:empty")} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "council", "connect-wallet-button"]))
    }
  };
};
