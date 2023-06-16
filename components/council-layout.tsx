import React, {ReactNode, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CardBecomeCouncil from "components/card-become-council";
import { MiniTabs } from "components/mini-tabs";
import PageHero, {InfosHero} from "components/page-hero";

import {useAppState} from "contexts/app-state";

import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import {useNetwork} from "x-hooks/use-network";

interface CouncilLayoutProps {
  children?: ReactNode;
  totalReadyBounties?: number;
}

export default function CouncilLayout({ 
  children,
  totalReadyBounties,
}: CouncilLayoutProps) {
  const { asPath, query, push } = useRouter();
  const { t } = useTranslation(["common", "council"]);

  const { chain } = useChain();
  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { getCuratorsResume, searchIssues } = useApi();

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
      label: t("heroes.in-network"),
      currency: t("misc.token"),
    },
  ]);

  function handleUrlCurators (type: string) {
    return push(getURLWithNetwork("/curators", {
      type
    }), asPath, { shallow: false, scroll: false });
  }

  const internalLinks = [
    {
      onClick: () => handleUrlCurators("curators-list"),
      label: t("council:council-list"),
      active: query?.type === "curators-list" || !query?.type
    },
    {
      onClick: () => handleUrlCurators("ready-to-propose"),
      label: t("council:ready-to-propose"),
      active: query?.type === "ready-to-propose" 
    },
    {
      onClick: () => handleUrlCurators("ready-to-dispute"),
      label: t("council:ready-to-dispute"),
      active: query?.type === "ready-to-dispute"
    },
    {
      onClick: () => handleUrlCurators("ready-to-close"),
      label: t("council:ready-to-close"),
      active: query?.type === "ready-to-close"
    }
  ]

  async function loadTotals() {
    if (!state.Service?.network?.active?.name || !chain) return;
    
    const [{ totalActiveCurators, totalValue }, distributed] = await Promise.all([
      getCuratorsResume({
        networkName: state.Service?.network?.active?.name,
        chainShortName: chain.chainShortName
      }),
      searchIssues({
        state: "closed",
        networkName: state.Service.network.active.name,
        tokenAddress: state.Service?.network?.active?.networkToken?.address,
        chainId: chain.chainId.toString()
      })
        .then(({ rows } : { rows: IssueBigNumberData[] }) => 
          rows.reduce((acc, { payments }) => acc + payments.reduce((acc, { ammount }) => acc + ammount, 0), 0))
    ]);

    setInfos([
      {
        value: totalReadyBounties,
        label: t("council:ready-bountys"),
      },
      {
        value: totalActiveCurators,
        label: t("council:council-members"),
      },
      {
        value: distributed,
        label: t("council:distributed-developers"),
        currency: state.Service?.network?.active?.networkToken?.symbol,
      },
      {
        value: totalValue,
        label: t("heroes.in-network"),
        currency: state.Service?.network?.active?.networkToken?.symbol,
      },
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, [state.Service?.network?.active?.name, chain]);

  useEffect(() => {
    if(!query?.type) handleUrlCurators("curators-list")
  }, [query?.type])

  return (
    <div>
      <PageHero
        title={t("council:title")}
        subtitle={t("council:subtitle", {
          token: state.Service?.network?.active?.networkToken?.symbol,
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