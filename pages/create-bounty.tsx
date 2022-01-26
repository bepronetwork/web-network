import {useRouter} from 'next/router';
import clsx from 'clsx';
import {GetServerSideProps, GetStaticProps} from 'next/types'
import React, {useContext, useEffect, useState} from 'react';
import {BeproService} from '@services/bepro-service';
import InputNumber from '@components/input-number';
import ConnectGithub from '@components/connect-github';
import {ApplicationContext} from '@contexts/application';
import ConnectWalletButton from '@components/connect-wallet-button';
import {addTransaction} from '@reducers/add-transaction';
import {toastError} from '@contexts/reducers/add-toast'
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';
import {formatNumberToCurrency} from '@helpers/formatNumber'
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import LockedIcon from '@assets/icons/locked-icon';
import ReposDropdown from '@components/repos-dropdown';
import BranchsDropdown from '@components/branchs-dropdown';
import Button from '@components/button';
import useApi from '@x-hooks/use-api';
import {User} from '@interfaces/api-response';
import useTransactions from '@x-hooks/useTransactions';
import { changeTransactionalTokenApproval } from '@contexts/reducers/change-transactional-token-approval';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

interface Amount {
  value?: string,
  formattedValue: string,
  floatValue?: number
}

export default function PageCreateIssue() {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueAmount, setIssueAmount] = useState<Amount>({value: '', formattedValue: '', floatValue: 0});
  const [balance, setBalance] = useState(0);
  const {dispatch, state: {currentAddress, githubHandle, myTransactions, isTransactionalTokenApproved}} = useContext(ApplicationContext);
  const [currentUser, setCurrentUser] = useState<User>();
  const [repository_id, setRepositoryId] = useState(``);
  const [branch, setBranch] = useState(``);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const {getUserOf, createIssue: apiCreateIssue, patchIssueWithScId} = useApi();
  const txWindow = useTransactions();
  const { t } = useTranslation(['common', 'create-bounty'])

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
                    throw new Error(t('errors.approve-transaction'));
                  return txInfo;
                })
                .then(txInfo => {
                  txWindow.updateItem(tmpTransactional.payload.id, BeproService.parseTransaction(txInfo, tmpTransactional.payload));

                  BeproService.isApprovedTransactionalToken()
                              .then(approval => {
                                dispatch(changeTransactionalTokenApproval(approval))
                              })
                              .catch(error => console.log('error', error))
                })
                .catch(e => {
                  console.error(e);
                  if (e?.message?.search(`User denied`) > -1)
                    dispatch(updateTransaction({...tmpTransactional.payload as any, remove: true}));
                  else dispatch(updateTransaction({...tmpTransactional.payload as any, status: TransactionStatus.failed}));
                })

  }

  function cleanFields() {
    setIssueTitle('')
    setIssueDescription('')
    setIssueAmount({value: '0', formattedValue: '0', floatValue: 0})
  }

  async function createIssue() {
    const payload = {
      title: issueTitle,
      description: issueDescription,
      amount: issueAmount.floatValue,
      creatorAddress: BeproService.address,
      creatorGithub: currentUser?.githubLogin,
      repository_id,
      branch
    }
    const contractPayload = {tokenAmount: issueAmount.floatValue,};

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount: payload.amount});

    setRedirecting(true)
    apiCreateIssue(payload)
                      .then(cid => {
                        if (!cid)
                          throw new Error(t('errors.creating-issue'));
                        dispatch(openIssueTx);
                        return BeproService.network.openIssue({...contractPayload, cid: [repository_id, cid].join(`/`)})
                                           .then(txInfo => {
                                             txWindow.updateItem(openIssueTx.payload.id, BeproService.parseTransaction(txInfo, openIssueTx.payload));
                                             // BeproService.parseTransaction(txInfo, openIssueTx.payload)
                                             //             .then(block => dispatch(updateTransaction(block)))
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
                                return dispatch(toastError(t('create-bounty:errors.creating-bounty')));;
                            await router.push(`/bounty?id=${githubId}&repoId=${repository_id}`)
                          }))
                      .catch(e => {
                        console.error(`Failed to createIssue`, e);
                        cleanFields();
                        if (e?.message?.search(`User denied`) > -1)
                          dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                        else dispatch(updateTransaction({...openIssueTx.payload as any, status: TransactionStatus.failed}));

                        dispatch(toastError(e.message || t('create-bounty:errors.creating-bounty')));
                        return false;
                      }).finally(()=> setRedirecting(false))
  }

  const issueContentIsValid = (): boolean => !!issueTitle && !!issueDescription;

  const verifyAmountBiggerThanBalance = (): boolean => !(issueAmount.floatValue > Number(balance))

  const verifyTransactionState = (type: TransactionTypes): boolean => !!myTransactions.find(transactions=> transactions.type === type && transactions.status === TransactionStatus.pending);

  function isCreateButtonDisabled() {
    return [
      isTransactionalTokenApproved,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue,
      !verifyTransactionState(TransactionTypes.openIssue),
      !!repository_id,
      !!branch,
      !redirecting,
    ].some(value => value === false);
  }

  const isApproveButtonDisable = (): boolean =>[
    !isTransactionalTokenApproved,
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
                <h2>{t('create-bounty:title')}</h2>
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
              <h3 className="mb-4 text-white">{t('misc.details')}</h3>
              <div className="form-group mb-4">
                <label className="caption-small mb-2">{t('create-bounty:fields.title.label')}</label>
                <input type="text"
                       className="form-control rounded-lg" placeholder={t('create-bounty:fields.title.placeholder')}
                       value={issueTitle}
                       onChange={e => setIssueTitle(e.target.value)}
                />
                <p className="p-small text-gray trans my-2">{t('create-bounty:fields.title.tip')}</p>
              </div>
              <div className="form-group">
                <label className="caption-small mb-2">{t('create-bounty:fields.description.label')}</label>
                <textarea className="form-control" rows={6} placeholder={t('create-bounty:fields.description.placeholder')}
                          value={issueDescription}
                          onChange={e => setIssueDescription(e.target.value)}/>
              </div>
              <div className="row mb-4">
                <div className="col">
                  <ReposDropdown onSelected={opt => {
                    setRepositoryId(opt.value) 
                    setBranch(null)
                  }} />
                </div>
                <div className="col">
                  <BranchsDropdown repoId={repository_id} onSelected={opt => setBranch(opt.value)} />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <InputNumber
                    thousandSeparator
                    max={balance}
                    className={clsx({'text-muted': isTransactionalTokenApproved})}
                    label={t('create-bounty:fields.amount.label')}
                    symbol={t('$bepro')}
                    value={issueAmount.formattedValue}
                    placeholder="0"
                    disabled={!isTransactionalTokenApproved}
                    onValueChange={handleIssueAmountOnValueChange}
                    onBlur={handleIssueAmountBlurChange}
                    helperText={
                      <>
                        {t('create-bounty:fields.amount.info', { amount: formatNumberToCurrency(balance, { maximumFractionDigits: 18 }) })}
                        {isTransactionalTokenApproved && (
                          <span
                            className="caption-small text-blue ml-1 cursor-pointer text-uppercase"
                            onClick={() => setIssueAmount({formattedValue: balance.toString()})}>
                          {t('create-bounty:fields.amount.max')}
                      </span>
                        )}
                      </>
                    }
                  />
                </div>
                <div className="col">
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center mt-4">
                {!githubHandle ? (
                  <div className="mt-3 mb-0">
                    <ConnectGithub />
                  </div>
                ) : (
                  <>
                    {!isTransactionalTokenApproved ?
                      <Button className="me-3" disabled={isApproveButtonDisable()} onClick={allowCreateIssue}>{t('actions.approve')}</Button>
                      : null
                    }
                    <Button disabled={isCreateButtonDisabled()}
                            onClick={createIssue}>{isCreateButtonDisabled() && <LockedIcon className="mr-1" width={13} height={13}/>}<span>{t('create-bounty:create-bounty')}</span>
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

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'create-bounty', 'connect-wallet-button'])),
    },
  };
};
