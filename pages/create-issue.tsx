import { GetStaticProps } from 'next'
import React, { useState } from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';

export default function PageCreateIssue() {


  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<number>(0);
  const [allowedTransaction, setAllowedTransaction] = useState<boolean>(false);

  // TODO add loaders since is slow on metamask
  const allow = async (evt) => {
    evt.preventDefault();
    await BeproService.login();
    const beproAddress = await BeproService.getAddress();
    const payload = {
      amount: issueAmount,
      address: beproAddress
    }
    const res = await BeproService.network.approveTransactionalERC20Token();
    const resApproved = await BeproService.network.isApprovedTransactionalToken(payload);
    if (resApproved) {
      setAllowedTransaction(true);
    }

  }
  const createIssue = async (evt) => {
    evt.preventDefault();

    const payload = {
      title: issueTitle,
      description: issueDescription,
      issueId: null,
    }
    const beproAddress = await BeproService.getAddress();
    const contractPayload = {tokenAmount: issueAmount, cid: beproAddress};
    const res = await BeproService.network.openIssue(contractPayload);
    console.log("🚀 ~ file: create-issue.tsx ~ line 41 ~ createIssue ~ res", res)

    payload.issueId = res?.transactionHash;
    const res2 = await GithubMicroService.createIssue(payload);

  }

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
                    <input min="0" type="number" className="form-control" placeholder="0"
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
                    {!allowedTransaction ?
                      <button className="btn btn-lg btn-primary" onClick={allow}>Allow the Nework Protocol to use your BEPRO</button>
                      : null
                    }
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <button className="btn btn-lg btn-primary" disabled={!allowedTransaction}>Create Issue</button>
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
