import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';
import BeproService from '../services/bepro';

export default function PageCreateIssue() {


  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<number>(0);

  const createIssue = async (evt) => {
    evt.preventDefault();

    const payload = {
      title: issueTitle,
      description: issueDescription,
    }
    // await axios.post('/issues', payload);
    const beproAddress = await BeproService.getAddress();
    const test = await BeproService.network.openIssue({tokenAmount: issueAmount, address: beproAddress});

  }
  const beproMax = 100;
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
        <form onSubmit={createIssue}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="content-wrapper mt-up mb-5">
                  <h4 className="h4 mr-2">Lock</h4>
                  <div className="form-group mb-4">
                    <label className="p-small trans mb-2">Issue title</label>
                    <input type="text"
                      className="form-control" placeholder="Your issue title"
                      value={issueTitle}
                      onChange={e => setIssueTitle(e.target.value)}
                      />
                  </div>
                  <div className="form-group mb-4">
                    <label className="p-small trans mb-2">Set $BEPRO ammout</label>
                    <input min="0" max="100" type="number" className="form-control" placeholder="0"
                      value={issueAmount}
                      onChange={e => setIssueAmount(parseInt(e.target.value))}/>
                  </div>
                  <div className="form-group">
                    <label>Issue description</label>
                    <textarea className="form-control" rows="4" placeholder="Type a description..."
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-flex align-items-center">
                    <button className="btn btn-lg btn-primary">Create Issue</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </form>

      </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
