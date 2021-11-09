import {useRouter} from 'next/router';
import clsx from 'clsx';
import {GetStaticProps} from 'next/types'
import React, {useContext, useEffect, useState} from 'react';
import {BeproService} from '@services/bepro-service';
import InputNumber from '@components/input-number';
import ConnectGithub from "@components/connect-github";
import {ApplicationContext} from '@contexts/application';
import ConnectWalletButton from '@components/connect-wallet-button';
import {addTransaction} from '@reducers/add-transaction';
import {toastError, toastSuccess} from '@contexts/reducers/add-toast'
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';
import {formatNumberToCurrency} from '@helpers/formatNumber'
import { TransactionStatus } from '@interfaces/enums/transaction-status';
import LockIcon from '@assets/icons/lock';
import ReposDropdown from '@components/repos-dropdown';
import Button from '@components/button';
import useApi from '@x-hooks/use-api';
import {User} from '@services/github-microservice';

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
  const [repository_id, setRepositoryId] = useState(``);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const {getUserOf, createIssue: apiCreateIssue, patchIssueWithScId} = useApi();

  async function allowCreateIssue() {
    const loggedIn = await BeproService.login();
    if (!loggedIn)
      return;

    const tmpTransactional = addTransaction({
                                              type: TransactionTypes.approveTransactionalERC20Token,
                                            });
    dispatch(tmpTransactional);

    BeproService.network.approveTransactionalERC20Token()
                .then(txInfo => {
                  if (!txInfo)
                    throw new Error(`Failed to approve transaction`);
                  return txInfo;
                })
                .then(txInfo => {
                  BeproService.network.isApprovedTransactionalToken({address: BeproService.address, amount: issueAmount.floatValue})
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

  function cleanFields() {
    setIssueTitle('')
    setIssueDescription('')
    setIssueAmount({value: '0', formattedValue: '0', floatValue: 0})
    setAllowedTransaction(false)
  }

  async function createIssue() {
    const payload = {
      title: issueTitle,
      description: issueDescription,
      amount: issueAmount.floatValue,
      creatorAddress: BeproService.address,
      creatorGithub: currentUser?.githubLogin,
      repository_id,
    }
    const contractPayload = {tokenAmount: issueAmount.floatValue,};

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount: payload.amount});
    dispatch(openIssueTx);
    setRedirecting(true)
    apiCreateIssue(payload)
                      .then(cid => {
                        if (!cid)
                          throw new Error(`Failed to create github issue!`);
                        return BeproService.network.openIssue({...contractPayload, cid: [repository_id, cid].join(`/`)})
                                           .then(txInfo => {
                                             BeproService.parseTransaction(txInfo, openIssueTx.payload)
                                                         .then(block => dispatch(updateTransaction(block)))
                                             return {
                                               githubId: cid,
                                               issueId: txInfo.events?.OpenIssue?.returnValues?.id && [repository_id, cid].join(`/`)
                                             };
                                           })
                      })
                      .then(({githubId, issueId}) =>
                        patchIssueWithScId(repository_id, githubId, issueId)
                          .then(async(result) => {
                            if (!result)
                                return dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                            await router.push(`/issue?id=${githubId}&repoId=${repository_id}`)
                          }))
                      .catch(e => {
                        console.error(`Failed to createIssue`, e);
                        cleanFields();
                        dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                        dispatch(toastError(e.message || `Error creating issue`));
                        return false;
                      }).finally(()=> setRedirecting(false))
  }

  const issueContentIsValid = (): boolean => !!issueTitle && !!issueDescription;

  const verifyAmountBiggerThanBalance = (): boolean => !(issueAmount.floatValue > Number(balance))

  const verifyTransactionState = (type: TransactionTypes): boolean => !!myTransactions.find(transactions=> transactions.type === type && transactions.status === TransactionStatus.pending);

  function isCreateButtonDisabled() {
    return [
      allowedTransaction,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue,
      !verifyTransactionState(TransactionTypes.openIssue),
      !!repository_id,
      !redirecting,
    ].some(value => value === false);
  }

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
    getUserOf(currentAddress).then(setCurrentUser);
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
              <h3 className="h3 mr-2 mb-4 text-white text-opacity-1">Details</h3>
              <div className="form-group mb-4">
                <label className="smallCaption mb-2 text-uppercase">Issue title</label>
                <input type="text"
                       className="form-control rounded-lg" placeholder="Your issue title"
                       value={issueTitle}
                       onChange={e => setIssueTitle(e.target.value)}
                />
                <p className="p-small trans my-2">Tip: Try to be as much descriptive as possible</p>
              </div>
              <div className="form-group">
                <label className="smallCaption mb-2 text-uppercase">Description</label>
                <textarea className="form-control" rows={6} placeholder="Type a description..."
                          value={issueDescription}
                          onChange={e => setIssueDescription(e.target.value)}/>
              </div>
              <div className="row">
                <div className="col">
                  <InputNumber
                    thousandSeparator
                    max={balance}
                    className={clsx({'text-muted': allowedTransaction})}
                    label="SET $BEPRO VALUE"
                    symbol="$BEPRO"
                    value={issueAmount.formattedValue}
                    disabled={allowedTransaction}
                    onValueChange={handleIssueAmountOnValueChange}
                    onBlur={handleIssueAmountBlurChange}
                    helperText={
                      <>
                        {formatNumberToCurrency(balance)} $BEPRO Available
                        {!allowedTransaction && (
                          <span
                            className="smallCaption text-blue ml-1 cursor-pointer text-uppercase"
                            onClick={() => setIssueAmount({formattedValue: balance.toString()})}>
                        Max
                      </span>
                        )}
                      </>
                    }
                  />
                </div>
                <div className="col">
                  <ReposDropdown onSelected={opt => setRepositoryId(opt.value)} />
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center mt-4">
                {!githubHandle ? (
                  <div className="mt-3 mb-0">
                    <ConnectGithub />
                  </div>
                ) : (
                  <>
                    {!allowedTransaction ?
                      <Button className="me-3" disabled={isApproveButtonDisable()} onClick={allowCreateIssue}>Approve</Button>
                      : null
                    }
                    <Button disabled={isCreateButtonDisabled()}
                            onClick={createIssue}>{isCreateButtonDisabled() && <LockIcon className="mr-1" width={13} height={13}/>}<span>Create Issue</span>
                    </Button>
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
