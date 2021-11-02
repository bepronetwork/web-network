import { GetStaticProps } from "next";
import React, { ReactNode, ReactNodeArray, useState } from "react";
import PageHero from "./page-hero";
import clsx from "clsx";
import InternalLink from "./internal-link";

export default function Oracle({
  children,
  buttonPrimaryActive,
}: {
  children?: ReactNode | ReactNodeArray;
  buttonPrimaryActive: boolean;
}) {
  return (
    <div>
      <PageHero title="Curate the Network" />
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink href="/oracle/new-issues" component="a" className={clsx("subnav-item mr-3 h3", {active: buttonPrimaryActive,})} active passHref>
              New issues
            </InternalLink>

            <InternalLink href="/oracle/ready-to-merge" component="a" className={clsx("subnav-item h3", {active: !buttonPrimaryActive,})} active passHref>
              Ready to merge
            </InternalLink>
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
