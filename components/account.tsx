import AccountHero from "./account-hero";
import React, { ComponentPropsWithoutRef, useContext } from "react";
import ConnectGithub from "./connect-github";
import { ApplicationContext } from "@contexts/application";
import clsx from "clsx";
import InternalLink from "./internal-link";

interface Props extends ComponentPropsWithoutRef<"div"> {
  buttonPrimaryActive: boolean;
}

export default function Account({
  children,
  buttonPrimaryActive,
}: Props): JSX.Element {
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
            <InternalLink href="/account" component="a" className={clsx("subnav-item mr-3 h3", {active: buttonPrimaryActive,})} active passHref>
              My issues
            </InternalLink>

            <InternalLink href="/account/my-oracles" component="a" className={clsx("subnav-item h3", {active: !buttonPrimaryActive,})} active passHref>
              My oracles
            </InternalLink>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
