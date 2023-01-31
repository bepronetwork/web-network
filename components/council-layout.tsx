import React, {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CardBecomeCouncil from "components/card-become-council";
import { MiniTabs } from "components/mini-tabs";
import PageHero, {InfosHero} from "components/page-hero";

import {useAppState} from "contexts/app-state";
import { changeActiveNetwork } from "contexts/reducers/change-service";

import { Curator } from "interfaces/curators";
import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import {useNetwork} from "x-hooks/use-network";

export default function CouncilLayout({ children }) {
  const { asPath, push } = useRouter();
  const { t } = useTranslation(["common", "council"]);

  const { chain } = useChain();
  const { state, dispatch} = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { getTotalBounties, searchCurators, searchIssues } = useApi();

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
    }), undefined, { shallow: true  })
  }

  const internalLinks = [
    {
      onClick: () => handleUrlCurators("ready-to-propose"),
      label: t("council:ready-to-propose"),
      active: asPath.endsWith("/curators") || asPath.endsWith("ready-to-propose")
    },
    {
      onClick: () => handleUrlCurators("ready-to-dispute"),
      label: t("council:ready-to-dispute"),
      active: asPath.endsWith("ready-to-dispute")
    },
    {
      onClick: () => handleUrlCurators("ready-to-close"),
      label: t("council:ready-to-close"),
      active: asPath.endsWith("ready-to-close")
    },
    {
      onClick: () => handleUrlCurators("curators-list"),
      label: t("council:council-list"),
      active: asPath.endsWith("curators-list")
    }
  ]

  async function loadTotals() {
    if (!state.Service?.network?.active?.name || !chain) return;
    
    const [totalBounties, onNetwork, curators, distributed] = await Promise.all([
      getTotalBounties(state.Service?.network?.active?.name, "ready"),
      searchCurators({
        networkName: state.Service?.network?.active?.name,
        chainShortName: chain.chainShortName
      }).then(({ rows }) => rows),
      searchIssues({
        state: "closed",
        networkName: state.Service.network.active.name,
        tokenAddress: state.Service?.network?.active?.networkToken?.address,
        chainId: chain.chainId.toString()
      })
        .then(({ rows } : { rows: IssueBigNumberData[] }) => 
          rows.reduce((acc, { payments }) => acc + payments.reduce((acc, { ammount }) => acc + ammount, 0), 0))
    ])
      .then(([totalBounties, curators, distributed]) => {
        const { onNetwork, totalCurators } = (curators as Curator[]).reduce((acc, curator) => ({
          onNetwork: new BigNumber(acc.onNetwork).plus(curator.tokensLocked).toFixed(),
          totalCurators: acc.totalCurators + (curator.isCurrentlyCurator ? 1 : 0 )
        }), { onNetwork: "0", totalCurators: 0 });

        return [totalBounties, onNetwork, totalCurators, distributed];
      });

    dispatch(changeActiveNetwork(Object.assign(state.Service.network.active, { curators })));

    setInfos([
      {
        value: totalBounties,
        label: t("council:ready-bountys"),
      },
      {
        value: curators,
        label: t("council:council-members"),
      },
      {
        value: distributed,
        label: t("council:distributed-developers"),
        currency: state.Service?.network?.active?.networkToken?.symbol,
      },
      {
        value: onNetwork,
        label: t("heroes.in-network"),
        currency: state.Service?.network?.active?.networkToken?.symbol,
      },
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, [state.Service?.network?.active?.name, chain]);

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