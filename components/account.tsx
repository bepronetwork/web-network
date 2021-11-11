import AccountHero from "./account-hero";
import React, { ComponentPropsWithoutRef, useContext } from "react";
import ConnectGithub from "./connect-github";
import { ApplicationContext } from "@contexts/application";
import clsx from "clsx";
import InternalLink from "./internal-link";

export default function Account({
  children
}): JSX.Element {
  const {
    state: { githubHandle },
  } = useContext(ApplicationContext);

  return (
    <div>
      <AccountHero />

      {(!githubHandle && <ConnectGithub />) || ``}

      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink href="/account" label="My issues" className={clsx("mr-3 h3 p-0")} nav transparent />

            <InternalLink href="/account/my-oracles" label="My oracles" className={clsx("h3 p-0")} nav transparent />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
