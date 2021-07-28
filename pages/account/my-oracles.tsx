import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import AccountHero from "components/account-hero";
import OraclesActions from "components/oracles-actions";
import OraclesDelegation from "components/oracles-delegation";
import OraclesTakeBack from "components/oracles-take-back";

export default function PageAccountOracles() {
  return (
    <div>
      <AccountHero></AccountHero>
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <Link href="/account">
              <a className="subnav-item mr-3" href="/account">
                <h3 className="h3">My issues</h3>
              </a>
            </Link>
            <Link href="/account">
              <a className="subnav-item active" href="/account-oracles">
                <h3 className="h3">My oracles</h3>
              </a>
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center mb-5">
          <OraclesActions />
          <OraclesDelegation />
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <OraclesTakeBack />
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="content-wrapper mb-5">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="h4">How to use Oracles?</h4>
                  <p>
                    Oracles can be used on Council to vote and approve issues
                  </p>
                </div>
                <div className="col-md-6">
                  <h4 className="h4">Why use Oracles?</h4>
                  <p>
                    Oracles can be used on Council to vote and approve issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
