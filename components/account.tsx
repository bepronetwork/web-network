import AccountHero from "./account-hero";
import Link from "next/link";
import React, {ComponentPropsWithoutRef, useContext} from 'react';
import ConnectGithub from './connect-github';
import {ApplicationContext} from '../contexts/application';

interface Props extends ComponentPropsWithoutRef<"div"> {}

export default function Account({ children }: Props): JSX.Element {
  const {state: {githubHandle}} = useContext(ApplicationContext);

  return (
    <div>
      <AccountHero />

      {!githubHandle && <ConnectGithub /> || ``}

      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <Link href="/account" passHref>
              <a className="subnav-item mr-3 h3">My issues</a>
            </Link>
            <Link href="/account/my-oracles" passHref>
              <a className="subnav-item h3">My oracles</a>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
