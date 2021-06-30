import { GetStaticProps } from 'next'
import { title } from 'process';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { toNumber } from '../helpers/number-transformation';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';

export default function PageCreateIssue() {

  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<string>('0');
  const [balance, setBalance] = useState<string>('0');
  const [allowedTransaction, setAllowedTransaction] = useState<boolean>(false);


  useEffect(() => {
    const resBepro = async () => {
      await BeproService.login();
      setBalance(await BeproService.network.getBEPROStaked())
    }
    resBepro()
  },[])

  // TODO add loaders since is slow on metamask
  const allow = async (evt) => {
    evt.preventDefault();
    await BeproService.login();
    const beproAddress = await BeproService.getAddress();
    const payload = {
      amount: toNumber(issueAmount),
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
    const contractPayload = {tokenAmount: toNumber(issueAmount), cid: beproAddress};
    const res = await BeproService.network.openIssue(contractPayload);
    console.log("🚀 ~ file: create-issue.tsx ~ line 41 ~ createIssue ~ res", res)

    payload.issueId = res.events?.OpenIssue?.returnValues?.id;
    const res2 = await GithubMicroService.createIssue(payload);

  }

  const titleAndIssueExist = () => {
    return !(issueTitle.length && issueDescription.length)
  }

  const verifyAmountBiggerThanBalance = () => {
    return !(toNumber(issueAmount) > toNumber(balance))
  }

  const checksToEnableCreateIssue = () => {
    if (allowedTransaction === false){
      return true
    }else if(titleAndIssueExist() === true){
      return true
    }else if(verifyAmountBiggerThanBalance() === false){
      return true
    }else if(Number(issueAmount) <= 0 ){
      return true
    }else {
      return false
    }
  }

  const handleIssueAmountBlurChange = (event: ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;

    if (Number(value) > Number(balance)) {
      value = balance;
    }

    setIssueAmount(value);
  }

  const handleIssueAmountOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;

    if (Number(value) < 0) {
      value = '0';
    }

    setIssueAmount(value);
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
                      <input min="0" max={`${balance}`} step="0.0000001" type="number" className="form-control" placeholder="0"
                        value={issueAmount}
                        onChange={handleIssueAmountOnChange}
                        onBlur={handleIssueAmountBlurChange}/>
                      <span className="input-group-text text-white-50 p-small">$BEPRO</span>
                    </div>
                    <div className="d-flex justify-content">
                    <p className="p-small trans my-2">{balance} $BEPRO </p> 
                    <a className="button-max p-small ms-1 my-2" onClick={() => setIssueAmount(String(balance))}>(Max)</a> 
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="p-small mb-2">Description</label>
                    <textarea className="form-control" rows={6} placeholder="Type a description..."
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
                    <button className="btn btn-lg btn-primary" disabled={checksToEnableCreateIssue()}>Create Issue</button>
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
