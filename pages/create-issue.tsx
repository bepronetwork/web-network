import { GetStaticProps } from 'next'
import React, {useContext, useState} from 'react';
import {BeproService} from '../services/bepro-service';
import GithubMicroService from '../services/github-microservice';
import InputNumber from '../components/input-number';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import {ApplicationContext} from '../contexts/application';
import {changeLoadState} from '../contexts/reducers/change-load-state';

interface Amount {
  value?: string,
  formattedValue: string,
  floatValue?: number
}

export default function PageCreateIssue() {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<Amount>({ value: '0', formattedValue: '0', floatValue: 0});

  const [allowedTransaction, setAllowedTransaction] = useState<boolean>(false);
  const {dispatch, state: {beproStaked: balance}} = useContext(ApplicationContext);
  const router = useRouter()

  const allow = async (evt) => {
    evt.preventDefault();
    dispatch(changeLoadState(true))
    await BeproService.login()
    .then(() => BeproService.network.approveTransactionalERC20Token())
    .then(() => BeproService.address)
    .then(address => BeproService.network.isApprovedTransactionalToken({ address, amount: issueAmount.floatValue}))
    .then(transaction => {
        setAllowedTransaction(transaction)
        dispatch(changeLoadState(false))
    })
    .catch((error) => console.log('Error',error))
    .finally(() => dispatch(changeLoadState(false)))
  }

  const createIssue = async (evt) => {
    evt.preventDefault();
    dispatch(changeLoadState(true))

    const payload = {
      title: issueTitle,
      description: issueDescription
    }
    const beproAddress = BeproService.address;
    const contractPayload = {tokenAmount: issueAmount.floatValue, cid: beproAddress};
    console.log("pay", contractPayload)
    await BeproService.network.openIssue(contractPayload)
      .then((response) => GithubMicroService.createIssue({...payload, issueId: response.events?.OpenIssue?.returnValues?.id}))
      .then(() => {
        router.push('/account');
        cleanFields();
      })
      .catch((error) => console.log('Error', error))
      .finally(() => dispatch(changeLoadState(false)))
  }

  const cleanFields = () => {
    setIssueTitle('')
    setIssueDescription('')
    setIssueAmount({ value: '0', formattedValue: '0', floatValue: 0})
    setAllowedTransaction(false)
  }

  const issueContentIsValid = (): boolean =>  !!issueTitle && !!issueDescription;

  const verifyAmountBiggerThanBalance = (): boolean => !(issueAmount.floatValue > Number(balance))

  const isButtonDisabled = (): boolean => {
    return [
      allowedTransaction,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue
    ].some(value => value === false);
  }

  const handleIssueAmountBlurChange = () => {
    if (issueAmount.floatValue > Number(balance)) {
      setIssueAmount({formattedValue: balance.toString()});
    }
  }

  const handleIssueAmountOnValueChange = (values: Amount) => {
    if (values.floatValue < 0 || values.value === '-'){
      setIssueAmount({formattedValue: ''})
    }else {
      setIssueAmount(values)
    }
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
                  <InputNumber
                    thousandSeparator
                    max={balance}
                    className={clsx({ "text-muted": allowedTransaction })}
                    label="Set $BEPRO value"
                    symbol="$BEPRO"
                    value={issueAmount.formattedValue}
                    disabled={allowedTransaction}
                    onValueChange={handleIssueAmountOnValueChange}
                    onBlur={handleIssueAmountBlurChange}
                    helperText={
                      <>
                        {balance} $BEPRO
                      {!allowedTransaction && (
                          <button
                            className="btn btn-opac ml-1 py-1"
                            onClick={() => setIssueAmount({ formattedValue: balance.toString() })}>
                            Max
                          </button>
                        )}
                      </>
                    }
                  />
                  <div className="form-group">
                    <label className="p-small mb-2">Description</label>
                    <textarea className="form-control" rows={6} placeholder="Type a description..."
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-center align-items-center mt-4">
                  {!allowedTransaction ?
                        <button className="btn btn-lg btn-opac me-3 px-5" onClick={allow}>Approve</button>
                      : null
                  }
                    <button className="btn btn-lg btn-primary px-4" disabled={isButtonDisabled()}>Create Issue</button>
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
