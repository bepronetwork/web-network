import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import InternalLink from "components/internal-link";
import PageHero, {InfosHero} from "components/page-hero";

import useApi from "x-hooks/use-api";
import {useNetwork} from "x-hooks/use-network";

import {useAppState} from "../contexts/app-state";
import CardBecomeCouncil from "./card-become-council";

export default function CouncilLayout({ children }) {
  const { asPath } = useRouter();
  const { t } = useTranslation(["council"]);

  const {state} = useAppState();

  const { getTotalBounties } = useApi();
  const { getURLWithNetwork } = useNetwork();


  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("council:ready-bountys"),
    },
    {
      value: 0,
      label: t("council:council-members"),
    },
    {
      value: 0,
      label: t("council:distributed-developers"),
      currency: "BEPRO",
    },
    {
      value: 0,
      label: t("common:heroes.bounties-in-network"),
      currency: "BEPRO",
    },
  ]);

  async function loadTotals() {
    if (!state.Service?.active || !state.Service?.network?.active) return;
    
    const [totalBounties, onNetwork] = await Promise.all([
      getTotalBounties("ready"),
      state.Service?.active.getTotalNetworkToken(),
    ]);

    setInfos([
      {
        value: totalBounties,
        label: t("council:ready-bountys"),
      },
      {
        value: state.Service?.network?.active?.councilMembers?.length || 0,
        label: t("council:council-members"),
      },
      {
        value: 0,
        label: t("council:distributed-developers"),
        currency: "BEPRO",
      },
      {
        value: onNetwork.toFixed(),
        label: t("common:heroes.bounties-in-network"),
        currency: "BEPRO",
      },
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, [state.Service?.active, state.Service?.network?.active]);

  return (
    <div>
      <PageHero
        title={t("council:title")}
        subtitle={t("council:subtitle", {
          token: state.Service?.network?.networkToken?.symbol,
        })}
        infos={infos}
      />
      <div className="container pt-3">
        <div className="row">
          <div className="d-flex justify-content-center">
            <InternalLink
              href={getURLWithNetwork("/curators/ready-to-propose")}
              label={String(t("ready-to-propose"))}
              className={"mr-3 h3 p-0"}
              active={(asPath.endsWith("/curators") && true) || undefined}
              nav
              transparent
            />

            <InternalLink
              href={getURLWithNetwork("/curators/ready-to-merge")}
              label={String(t("ready-to-merge"))}
              className={"h3 p-0"}
              nav
              transparent
            />
          </div>
        </div>
      </div>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <div className="col-md-10 mt-2">
            {!state?.Service?.network?.active?.isCouncil && <CardBecomeCouncil />}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}