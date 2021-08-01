import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import AccountHero from "components/account-hero";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import OraclesTakeBack from "components/oracles-take-back";

export default function MyOracles() {
  return (
    <div>
      <AccountHero></AccountHero>
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <Link href="/account/" passHref>
              <a className="subnav-item active mr-3 h3">My issues</a>
            </Link>
            <Link href="/account/my-oracles" passHref>
              <a className="subnav-item h3">My oracles</a>
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center mb-5">
          <OraclesActions />
          <OraclesDelegate />
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
