import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CardBecomeCouncil from "components/card-become-council";
import InternalLink from "components/internal-link";
import PageHero, {InfosHero} from "components/page-hero";

import {useAppState} from "contexts/app-state";

import useApi from "x-hooks/use-api";
import {useNetwork} from "x-hooks/use-network";

import { MiniTabs } from "./mini-tabs";

export default function CouncilLayout({ children }) {
  const { asPath, push } = useRouter();
  const { t } = useTranslation(["common", "council"]);

  const {state} = useAppState();

  const { getTotalBounties } = useApi();
  const { getURLWithNetwork, updateActiveNetwork } = useNetwork();

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
      currency: t("misc.token"),
    },
    {
      value: 0,
      label: t("heroes.bounties-in-network"),
      currency: t("misc.token"),
    },
  ]);

  const internalLinks = [
    {
      onClick: () => push(getURLWithNetwork("/curators/ready-to-propose")),
      label: t("council:ready-to-propose"),
      active: asPath.endsWith("/curators") || asPath.endsWith("/ready-to-propose")
    },
    {
      onClick: () => push(getURLWithNetwork("/curators/ready-to-dispute")),
      label: t("council:ready-to-dispute"),
      active: asPath.endsWith("/ready-to-dispute")
    },
    {
      onClick: () => push(getURLWithNetwork("/curators/ready-to-close")),
      label: t("council:ready-to-close"),
      active: asPath.endsWith("/ready-to-close")
    },
    {
      onClick: () => push(getURLWithNetwork("/curators/curators-list")),
      label: t("council:council-list"),
      active: asPath.endsWith("/curators-list")
    }
  ]

  async function loadTotals() {
    if (!state.Service?.active?.network || !state.Service?.network?.active?.name) return;
    
    const [totalBounties, onNetwork] = await Promise.all([
      getTotalBounties("ready", state.Service?.network?.active?.name),
      state.Service?.active.getTotalNetworkToken(),
    ]);

    const totalCurators = 
      state.Service?.network?.active?.curators?.filter(({ isCurrentlyCurator }) => isCurrentlyCurator)?.length;

    setInfos([
      {
        value: totalBounties,
        label: t("council:ready-bountys"),
      },
      {
        value: totalCurators || 0,
        label: t("council:council-members"),
      },
      {
        value: 0,
        label: t("council:distributed-developers"),
        currency: state.Service?.network?.networkToken?.symbol,
      },
      {
        value: onNetwork.toFixed(),
        label: t("heroes.in-network"),
        currency: state.Service?.network?.networkToken?.symbol,
      },
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, [state.Service?.active?.network?.contractAddress, state.Service?.network?.active?.name]);

  useEffect(() => {
    updateActiveNetwork(true);
  }, []);

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
        <div className="d-flex justify-content-center">
          <MiniTabs items={internalLinks} />
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