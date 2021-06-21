import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';

export default function PageCreateIssue() {
  return (
      <>
        <div className="banner bg-bepro-blue mb-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="d-flex justify-content-center">
                  <h1 className="h1 mb-0">Create issue</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="content-wrapper mt-up mb-5">
                <h4 className="h4 mr-2">Lock</h4>
                <div className="form-group mb-4">
                  <label className="p-small trans mb-2">Issue title</label>
                  <input type="text" className="form-control" placeholder="Your issue title" />
                </div>
                <div className="form-group mb-4">
                  <label className="p-small trans mb-2">Set $BEPRO ammout</label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Issue description</label>
                  <textarea class="form-control" id="exampleFormControlTextarea1" rows="4"placeholder="Type a description..." ></textarea>
                </div>
                <div className="d-flex align-items-center">
                  <button className="btn btn-lg btn-primary">Create Issue</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
