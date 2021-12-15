import AccountHero from "./account-hero";
import React, { ComponentPropsWithoutRef, useContext } from "react";
import ConnectGithub from "./connect-github";
import { ApplicationContext } from "@contexts/application";
import clsx from "clsx";
import InternalLink from "./internal-link";
import { useTranslation } from "next-i18next";

export default function Account({
  children
}): JSX.Element {
  const {
    state: { githubHandle },
  } = useContext(ApplicationContext);
  const { t } = useTranslation(['common', 'bounty', 'pull-request'])

  return (
    <div>
      <AccountHero />

      {(!githubHandle && <ConnectGithub />) || ``}

      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink href="/account" label={String(t('bounty:label_other'))} className={clsx("mr-3 h4 p-0 text-capitalize")} activeClass="account-link-active" nav />

            <InternalLink href="/account/my-pull-requests" label={String(t('pull-request:label_other'))} className={clsx("mr-3 h4 p-0 text-capitalize")} activeClass="account-link-active" nav />

            <InternalLink href="/account/my-oracles" label={String(t('$oracles'))} className={clsx("h4 p-0")} activeClass="account-link-active" nav />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
