import React from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import AccountHero from "components/account-hero";
import ConnectGithub from "components/connect-github";
import ConnectWalletButton from "components/connect-wallet-button";
import NetworkThemeInjector from "components/custom-network/network-theme-injector";
import InternalLink from "components/internal-link";

import { useAuthentication } from "contexts/authentication";

import useNetworkTheme from "x-hooks/use-network";

export default function Account({ children }){
  const { t } = useTranslation([
    "common",
    "bounty",
    "pull-request",
    "custom-network"
  ]);

  const { wallet, user } = useAuthentication();

  const { getURLWithNetwork } = useNetworkTheme();

  return (
    <div>
      <NetworkThemeInjector />
      <AccountHero />

      <ConnectWalletButton asModal={true} />

      {(!user?.login && <ConnectGithub />) || ""}

      <div className="container mt-4">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink
              href={getURLWithNetwork("/account")}
              label={String(t("bounty:label_other"))}
              className={clsx("mr-3 h4 p-0 text-capitalize")}
              activeClass="account-link-active"
              nav
            />

            <InternalLink
              href={getURLWithNetwork("/account/my-pull-requests")}
              label={String(t("pull-request:label_other"))}
              className={clsx("mr-3 h4 p-0 text-capitalize")}
              activeClass="account-link-active"
              nav
            />

            <InternalLink
              href={getURLWithNetwork("/account/my-oracles")}
              label={String(t("$oracles"))}
              className={clsx("h4 p-0 mr-3")}
              activeClass="account-link-active"
              nav
            />
            
            <InternalLink
              href={getURLWithNetwork("/account/payments")}
              label={String(t("common:account.payments"))}
              className={clsx("mr-3 h4 p-0 text-capitalize")}
              activeClass="account-link-active"
              nav
            />

            <InternalLink
              href={getURLWithNetwork("/account/my-network")}
              label={String(t("custom-network:title"))}
              className={clsx("h4 p-0")}
              activeClass="account-link-active"
              nav
            />
          </div>
        </div>
      </div>

      {(wallet?.address && children) || <></>}
    </div>
  );
}
