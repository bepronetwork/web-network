import {useRouter} from 'next/router';
import clsx from 'clsx';
import {GetStaticProps} from 'next/types'
import React, {useContext, useEffect, useState} from 'react';
import {BeproService} from '@services/bepro-service';
import GithubMicroService, {User} from '@services/github-microservice';
import InputNumber from '@components/input-number';
import ConnectGithub from "@components/connect-github";
import {ApplicationContext} from '@contexts/application';
import ConnectWalletButton from '@components/connect-wallet-button';
import {addTransaction} from '@reducers/add-transaction';
import {toastSuccess} from '@contexts/reducers/add-toast'
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';
import {BlockTransaction,} from '@interfaces/transaction';
import {formatNumberToCurrency} from '@helpers/formatNumber'
import { TransactionStatus } from '@interfaces/enums/transaction-status';
interface Amount {
  value?: string,
  formattedValue: string,
  floatValue?: number
}

export default function PageCreateIssue() {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueAmount, setIssueAmount] = useState<Amount>({value: '0', formattedValue: '0', floatValue: 0});
  const [balance, setBalance] = useState(0);
  const [allowedTransaction, setAllowedTransaction] = useState<boolean>(false);
  const {dispatch, state: {currentAddress, githubHandle, myTransactions}} = useContext(ApplicationContext);
  const [currentUser, setCurrentUser] = useState<User>();
  const router = useRouter()

  async function allowCreateIssue() {
    const loggedIn = await BeproService.login();
    if (!loggedIn)
      return;

    const tmpTransactional = addTransaction({
                                              type: TransactionTypes.approveTransactionalERC20Token,
                                              amount: issueAmount.floatValue
                                            });
    dispatch(tmpTransactional);

    BeproService.network.approveTransactionalERC20Token()
                .then(txInfo => {
                  if (!txInfo)
                    throw new Error(`Failed to approve transaction`);
                  return txInfo;
                })
                .then(txInfo => {
                  BeproService.network.isApprovedTransactionalToken({
                                                                      address: BeproService.address,
                                                                      amount: issueAmount.floatValue
                                                                    })
                              .then(setAllowedTransaction)
                              .catch(() => setAllowedTransaction(false))
                              .finally(() => {
                                BeproService.parseTransaction(txInfo, tmpTransactional.payload)
                                            .then((info) => dispatch(updateTransaction(info)))
                              });
                })
                .catch(e => {
                  console.error(e);
                  dispatch(updateTransaction({...tmpTransactional.payload as any, remove: true}));
                })

  }

  async function createIssue() {
    const payload = {
      title: issueTitle,
      description: issueDescription,
      amount: issueAmount.floatValue,
      creatorAddress: BeproService.address,
      creatorGithub: currentUser?.githubLogin,
    }
    const contractPayload = {tokenAmount: issueAmount.floatValue,};

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount: payload.amount});
    dispatch(openIssueTx);

    let createIssueTx;

    const updateBlock = (block: BlockTransaction, remove = false) => {
      dispatch(updateTransaction({...block as any, remove}))
    }

    GithubMicroService.createIssue(payload)
                      .then(cid => {
                        if (!cid)
                          throw new Error(`Failed to create github issue!`);
                        return BeproService.network.createIssue({...contractPayload, cid})
                                           .then(txInfo => {
                                             BeproService.parseTransaction(txInfo, openIssueTx.payload)
                                                         .then(block => dispatch(updateTransaction(block)))
                                             return {
                                               githubId: cid,
                                               issueId: txInfo.events?.OpenIssue?.returnValues?.id
                                             };
                                           })
                      })
                      .then(({githubId, issueId}) => GithubMicroService.patchGithubId(githubId, issueId))
                      .then(result => {
                        if (!result)
                          return dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                      })
                      .catch(e => {
                        console.log(e);
                        dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                        return false;
                      })

    // BeproService.network.openIssue(contractPayload)
    //             .then(txInfo => {
    //               if (!txInfo)
    //                 throw new Error(`Failed to open issue`);
    //               return txInfo;
    //             })
    //             .then(txInfo => {
    //               BeproService.parseTransaction(txInfo, openIssueTx.payload)
    //                           .then(updateBlock)
    //               return txInfo;
    //             })
    //             .then((txInfo) => GithubMicroService.createIssue({
    //                                                          ...payload,
    //                                                          issueId: txInfo.events?.OpenIssue?.returnValues?.id
    //                                                        }))
    //             .then(() => {
    //               dispatch(toastSuccess(`Create Issue using ${issueAmount.value} $BEPROS`));
    //               return router.push(`/account`);
    //             })
    //             .catch(e => {
    //               cleanFields();
    //               dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
    //               console.error(e);
    //             })

  }

  function cleanFields() {
    setIssueTitle('')
    setIssueDescription('')
    setIssueAmount({value: '0', formattedValue: '0', floatValue: 0})
    setAllowedTransaction(false)
  }

  const issueContentIsValid = (): boolean => !!issueTitle && !!issueDescription;

  const verifyAmountBiggerThanBalance = (): boolean => !(issueAmount.floatValue > Number(balance))

  const verifyTransactionState = (type: TransactionTypes): boolean => !!myTransactions.find(transactions=> transactions.type === type && transactions.status === TransactionStatus.pending);

  const isCreateButtonDisabled = (): boolean => [
      allowedTransaction,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue,
      !verifyTransactionState(TransactionTypes.createIssue),
    ].some(value => value === false);

  const isApproveButtonDisable = (): boolean =>[
    issueAmount.floatValue > 0,
    !verifyTransactionState(TransactionTypes.approveTransactionalERC20Token),
  ].some(value => value === false)

  const handleIssueAmountBlurChange = () => {
    if (issueAmount.floatValue > Number(balance)) {
      setIssueAmount({formattedValue: balance.toString()});
    }
  }

  const handleIssueAmountOnValueChange = (values: Amount) => {
    if (values.floatValue < 0 || values.value === '-') {
      setIssueAmount({formattedValue: ''})
    } else {
      setIssueAmount(values)
    }
  }

  useEffect(() => {
    BeproService.getBalance('bepro').then(setBalance);
    GithubMicroService.getUserOf(currentAddress).then(setCurrentUser);
  }, [currentAddress])

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
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <ConnectWalletButton asModal={true} />
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
                className={clsx({'text-muted': allowedTransaction})}
                label="Set $BEPRO value"
                symbol="$BEPRO"
                value={issueAmount.formattedValue}
                disabled={allowedTransaction}
                onValueChange={handleIssueAmountOnValueChange}
                onBlur={handleIssueAmountBlurChange}
                helperText={
                  <>
                    {formatNumberToCurrency(balance)} $BEPRO
                    {!allowedTransaction && (
                      <button
                        className="btn btn-opac ml-1 py-1"
                        onClick={() => setIssueAmount({formattedValue: balance.toString()})}>
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
                          onChange={e => setIssueDescription(e.target.value)}/>
              </div>
              <div className="d-flex justify-content-center align-items-center mt-4">
                {!githubHandle ? (
                  <div className="mt-3 mb-0">
                    <ConnectGithub />
                  </div>
                ) : (
                  <>
                    {!allowedTransaction ?
                      <button className="btn btn-lg btn-opac me-3 px-5" disabled={isApproveButtonDisable()} onClick={allowCreateIssue}>Approve</button>
                      : null
                    }
                    <button className="btn btn-lg btn-primary px-4" disabled={isCreateButtonDisabled()}
                            onClick={createIssue}>Create Issue
                    </button>
                  </>
                )}
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
