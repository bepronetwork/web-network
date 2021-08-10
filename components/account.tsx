import AccountHero from "./account-hero";
import Link from "next/link";
import React, { ComponentPropsWithoutRef, useContext } from "react";
import ConnectGithub from "./connect-github";
import { ApplicationContext } from "../contexts/application";
import clsx from "clsx";

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
            <Link href="/account" passHref>
              <a
                className={clsx("subnav-item mr-3 h3", {
                  active: buttonPrimaryActive,
                })}
              >
                My issues
              </a>
            </Link>
            <Link href="/account/my-oracles" passHref>
              <a
                className={clsx("subnav-item h3", {
                  active: !buttonPrimaryActive,
                })}
              >
                My oracles
              </a>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
