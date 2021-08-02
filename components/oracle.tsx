import { GetStaticProps } from "next";
import React, { ReactNode, ReactNodeArray, useState } from "react";
import PageHero from "./page-hero";
import clsx from "clsx";
import Link from "next/link";

export default function Oracle({
  children,
  buttonPrimaryActive,
}: {
  children?: ReactNode | ReactNodeArray;
  buttonPrimaryActive: boolean;
}) {
  return (
    <div>
      <PageHero
        title="Approve issues"
        numIssuesInProgress={10}
        numIssuesClosed={12}
        numBeprosOnNetwork={120000} />
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <Link href="/oracle/new-issues">
              <a
                className={clsx("subnav-item mr-3", {
                  active: buttonPrimaryActive,
                })}
              >
                <h3 className="h3">New issues</h3>
              </a>
            </Link>
            <Link href="/oracle/ready-to-merge">
              <a
                className={clsx("subnav-item", {
                  active: !buttonPrimaryActive,
                })}
              >
                <h3 className="h3">Ready to merge</h3>
              </a>
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
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
