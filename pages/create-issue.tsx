import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import BeproService from '../services/bepro';

export default function PageCreateIssue() {

  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(2314);

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

  return (
      <>
        <div className="banner bg-bepro-blue mb-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="d-flex justify-content-center">
                  <h1 className="h1 mb-0">Create new issue</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={createIssue}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="content-wrapper mt-up mb-5">
                  <h3 className="h3 mr-2 mb-4">Details</h3>
                  <div className="form-group mb-4">
                    <label className="p-small mb-2">Issue title</label>
                    <input type="text"
                      className="form-control" placeholder="Your issue title"
                      value={issueTitle}
                      onChange={e => setIssueTitle(e.target.value)}
                      />
                    <p className="p-small trans my-2">Tip: Try to be as much descriptive as possible</p>
                  </div>
                  <div className="form-group col-md-4 mb-4">
                    <label className="p-small mb-2">Set $BEPRO value</label>
                    <div className="input-group">
                      <input min="0" max={balance} type="number" className="form-control" placeholder="0"
                        value={issueAmount}
                        onChange={e => setIssueAmount(parseInt(e.target.value))}/>
                      <span className="input-group-text text-white-50 p-small">$BEPRO</span>
                    </div>
                    <p className="p-small trans my-2">{isNaN(issueAmount)? balance : balance - issueAmount} $BEPRO (Max)</p>  
                  </div>
                  <div className="form-group">
                    <label className="p-small mb-2">Description</label>
                    <textarea className="form-control" rows={6} placeholder="Type a description..."
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-center align-items-center pt-4 pb-2">
                    <button type="button" className="btn btn-lg btn-opac me-3 px-5">Approve</button>
                    <button className="btn btn-lg btn-primary ms-3 px-4">Create Issue</button>
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
