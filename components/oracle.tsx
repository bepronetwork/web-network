import { GetStaticProps } from "next";
import React, { ReactNode, ReactNodeArray, useState } from "react";
import PageHero from "./page-hero";
import clsx from "clsx";
import InternalLink from "./internal-link";
import { useRouter } from "next/router";

export default function Oracle({
  children,
  buttonPrimaryActive,
}: {
  children?: ReactNode | ReactNodeArray;
  buttonPrimaryActive: boolean;
}) {
  const { asPath } = useRouter()

  return (
    <div>
      <PageHero title="Curate the Network" />
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink href="/oracle/new-bounties" label="New bounties" className={clsx("mr-3 h3 p-0")} active={asPath === '/oracle' && true || undefined} nav transparent />

            <InternalLink href="/oracle/ready-to-merge" label="Ready to merge" className={clsx("h3 p-0")} nav transparent />
          </div>
        </div>
      </div>
      <div className="container p-footer">
        <div className="row justify-content-center">{children}</div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
