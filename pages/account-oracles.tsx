import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import AccountHero from '../components/account-hero';
import IssueListItem from '../components/issue-list-item';
import MainNav from '../components/main-nav';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';

export default function PageAccountOracles() {
  return (
      <div>
        <MainNav></MainNav>
        <AccountHero></AccountHero>

        <div className="container">
          <div className="row">
            <div className="d-flex justify-content-center mb-3">
              <a className="subnav-item mr-3" href="/account"><h3 className="h3">My issues</h3></a>
              <a className="subnav-item active" href="/account-oracles"><h3 className="h3">My oracles</h3></a>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-5">
              <div className="content-wrapper">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex">
                    <a href="#" className="subnav-item active pl-0"><h4 className="h4 mb-0 mr-2">Lock</h4></a>
                    <a href="#"  className="subnav-item"><h4 className="h4 mb-0">Unlock</h4></a>
                  </div>
                  <span className="badge-opac">200 Available</span>
                </div>
                <p>Lock $BEPRO to get Oracles</p>
                <div className="form-group mb-4">
                  <label className="smallParagraph trans mb-2">$BEPRO Ammout</label>
                  <input type="number" className="form-control" placeholder="$BEPRO Ammout" />
                </div>
                <button className="btn btn-lg btn-primary w-100">LOCK</button>
              </div>
            </div>

            <div className="col-md-5">
              <div className="content-wrapper">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="h4 mb-0">Delegate oracles</h4>
                  <span className="badge-opac">200 Available</span>
                </div>
                <div className="form-group mb-4">
                  <label className="smallParagraph trans mb-2">Oracles Ammout</label>
                  <input type="number" className="form-control" placeholder="Oracles Ammout" />
                </div>
                <div className="form-group mb-4">
                  <label className="smallParagraph trans mb-2">Delegation address</label>
                  <input type="number" className="form-control" placeholder="Type and address" />
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

                    <div className="bg-opac w-100 mb-1 p-3">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <p className="color-purple mb-1">200,000 Oracles</p>
                          <p className="mb-0">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                          <button className="btn btn-md btn-white">TAKE BACK</button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-opac w-100 mb-1 p-3">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <p className="smallParagraph text-bold color-purple mb-1">200,000 Oracles</p>
                          <p className="smallParagraph mb-0">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                          <button className="btn btn-md btn-white">TAKE BACK</button>
                        </div>
                      </div>
                    </div>

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
                    <p>Oracles can be used on Council to vote and approve issues</p>
                  </div>
                  <div className="col-md-6">
                    <h4 className="h4">Why use Oracles?</h4>
                    <p>Oracles can be used on Council to vote and approve issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
