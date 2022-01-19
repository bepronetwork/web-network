import { GetStaticProps } from "next";
import React, { ReactNode, ReactNodeArray, useState } from "react";
import PageHero from "./page-hero";
import clsx from "clsx";
import InternalLink from "./internal-link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function Oracle({
  children,
  buttonPrimaryActive,
}: {
  children?: ReactNode | ReactNodeArray;
  buttonPrimaryActive: boolean;
}) {
  const { asPath } = useRouter()
  const { t } = useTranslation(['oracle'])

  return (
    <div>
      <PageHero title={t('title')} />
      <div className="container pt-3">
        <div className="row">
          <div className="d-flex justify-content-center">
            <InternalLink href="/oracle/new-bounties" label={String(t('new-bounties'))} className={clsx("mr-3 h3 p-0")} active={asPath.endsWith('/oracle') && true || undefined} nav transparent />

            <InternalLink href="/oracle/ready-to-merge" label={String(t('ready-to-merge'))} className={clsx("h3 p-0")} nav transparent />
          </div>
        </div>
      </div>
      <div className="container p-footer">
        <div className="row justify-content-center">{children}</div>
      </div>
    </div>
  );
}
