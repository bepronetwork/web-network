import { GetStaticProps } from 'next'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AccountHero from '../components/account-hero';
import IssueListItem from '../components/issue-list-item';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';
import AccountOraclesBeproMovement from "../components/account-oracles-bepro-movement";
import DelegateOracle from "../components/delegate-oracle";

export default function PageAccountOracles() {
  return (
      <div>
        <AccountHero></AccountHero>

        <div className="container">
          <div className="row">
            <div className="d-flex justify-content-center mb-3">
              <Link href="/account" ><a className="subnav-item mr-3" href="/account"><h3 className="h3">My issues</h3></a></Link>
              <Link href="/account" ><a className="subnav-item active" href="/account-oracles"><h3 className="h3">My oracles</h3></a></Link>
            </div>
          </div>
        </div>

      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-md-5">
            <AccountOraclesBeproMovement />
          </div>

          <div className="col-md-5">
            <div className="content-wrapper">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="h4 mb-0">Delegate oracles</h4>
                <span className="badge-opac">200 Available</span>
              </div>
              <div className="form-group mb-4">
                <label className="p-small trans mb-2">Oracles Ammout</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Oracles Ammout"
                />
              </div>
              <div className="form-group mb-4">
                <label className="p-small trans mb-2">Delegation address</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Type and address"
                />
              </div>
              <button className="btn btn-lg btn-primary w-100">DELEGATE</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="content-wrapper mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="h4 mb-0">Delegate oracles</h4>
                <span className="badge-opac">200 Available</span>
              </div>
              <div className="row">
                <div className="col">
                  <DelegateOracle
                    oracles={[
                      {
                        amount: 200000,
                        key: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                      },
                      {
                        amount: 150000,
                        key: "yrf2493p83kkfjhx0wlhbc1qxy2kgdygjrsqtzq2n0",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
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
