import {useContext, useEffect, useState} from 'react';
import Modal from './modal';
import ReactSelect from './react-select';
import CreateProposalDistributionItem from './create-proposal-distribution-item';
import sumObj from 'helpers/sumObj';
import {BeproService} from '@services/bepro-service';
import {pullRequest} from 'interfaces/issue-data';
import {ApplicationContext} from '@contexts/application';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';
import {toastWarning} from '@reducers/add-toast';
import Button from './button';
import {useRouter} from 'next/router';
import useOctokit from '@x-hooks/use-octokit';
import useRepos from '@x-hooks/use-repos';
import useApi from '@x-hooks/use-api';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import useTransactions from '@x-hooks/useTransactions';
import LockedIcon from '@assets/icons/locked-icon';
import clsx from 'clsx';
import { Proposal } from '@interfaces/proposal';
import { ProposalData } from '@services/github-microservice';
import { useTranslation } from 'next-i18next';

interface participants {
  githubHandle: string;
  address?: string;
}

interface SameProposal {
  currentPrId: number;
  prAddressAmount: {
    amount: number;
    address: string;
  }[];
}

export default function NewProposal({
                                      issueId,
                                      amountTotal,
                                      mergeProposals,
                                      pullRequests = [],
                                      handleBeproService,
                                      handleMicroService,
                                      isIssueOwner = false, isFinished = false
                                    }) {
  const {dispatch, state: {balance, currentAddress, beproInit, oracles, githubLogin},} = useContext(ApplicationContext);
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>();
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [participants, setParticipants] = useState<participants[]>([]);
  const [isCouncil, setIsCouncil] = useState(false);
  const [councilAmount, setCouncilAmount] = useState(0);
  const [currentGithubId, setCurrentGithubId] = useState<string>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const router = useRouter();
  const [[activeRepo]] = useRepos();
  const {getParticipants} = useOctokit();
  const {getUserWith, waitForMerge, processMergeProposal, processEvent} = useApi();
  const txWindow = useTransactions();
  const { t } = useTranslation('common')


  function handleChangeDistrib(params: { [key: string]: number }): void {
    setDistrib((prevState) => {
      handleCheckDistrib({
        ...prevState,
        ...params,
        })
      return({
      ...prevState,
      ...params,
      })
  });
  }

  async function loadProposalsMeta() {
    if (!issueId)
      return;

    const scIssueId = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
    const pool = [];

    for (const meta of mergeProposals as ProposalData[]) {
      const { scMergeId, pullRequestId } = meta;
      if (scMergeId) {
        const merge = await BeproService.network.getMergeById({merge_id: scMergeId, issue_id: scIssueId});
        pool.push({...merge, pullRequestId } as Proposal)
      }
    }

    setProposals(pool);
  }

  function isSameProposal(
    currentDistrbuition: SameProposal,
    currentProposals: SameProposal[]
  ) {
    return currentProposals.some((activeProposal) => {
      if (
        activeProposal.currentPrId === currentDistrbuition.currentPrId
      ) {
        return activeProposal.prAddressAmount.every((ap) =>
          currentDistrbuition.prAddressAmount.find(
            (p) => ap.amount === p.amount && ap.address === p.address
          )
        );
      } else {
        return false;
      }
    });
  }

  function handleCheckDistrib(obj: object) {
    var currentAmount = sumObj(obj)

    if (currentAmount === 100){
     const { id }  = pullRequests.find(
        (data) => data.githubId === currentGithubId
      )

      var currentDistrbuition = {
        currentPrId: id,
        prAddressAmount: participants.map(
          (item) =>  ({
            amount: ((amountTotal * obj[item.githubHandle])/100),
            address: item.address.toLowerCase()
          })
        )
      }
      
      var currentProposals = proposals.map((item) => {
        return ({
            currentPrId: Number(item.pullRequestId),
            prAddressAmount: item.prAddresses.map((value, key) => ({
              amount: Number(item.prAmounts[key]),
              address: value.toLowerCase()
            }))
          })
         })

      if(isSameProposal(currentDistrbuition, currentProposals)){
        handleInputColor("warning")
      }else {
        handleInputColor("success")
      } 
   }
   if (currentAmount > 0 && currentAmount < 100 || currentAmount > 100){
    handleInputColor("error")
   }
   if (currentAmount === 0){
    handleInputColor("normal")
   }
  }

  function handleInputColor ( name: string ) {
    if(name === "success"){
      setError(false)
      setSuccess(true)
      setWarning(false)
    }
    if(name === "error"){
      setError(true)
      setSuccess(false)
      setWarning(false)
    }
    if(name === "warning"){
      setError(false)
      setSuccess(false)
      setWarning(true)
    }
    if(name === "normal"){
      setError(false)
      setSuccess(false)
      setWarning(false)
    }
  }

  function getParticipantsPullRequest(id: string, githubId: string) {
    if (!activeRepo)
      return;

    getParticipants(+githubId, activeRepo.githubPath)
      .then(participants => {
        const tmpParticipants = [...participants]
        
        pullRequests?.find(pr => pr.githubId === githubId)?.reviewers?.forEach(participant => {
          if (!tmpParticipants.includes(participant)) tmpParticipants.push(participant)
        })

        return Promise.all(tmpParticipants.map(async login => {
          const {address, githubLogin, githubHandle} = await getUserWith(login);
          return {address, githubLogin, githubHandle};
        }))
      })
      .then((participantsPr) => {
        const tmpParticipants = participantsPr.filter(({address}) => !!address);
        const amountPerParticipant = 100 / tmpParticipants.length
        setDistrib(Object.fromEntries(tmpParticipants.map(participant => [participant.githubHandle, amountPerParticipant])))
        setCurrentGithubId(githubId);       
        setParticipants(tmpParticipants);
      })
      .catch((err) => {
        console.error('Error fetching pullRequestsParticipants', err)
      });
  }

  async function handleClickCreate(): Promise<void> {
    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    const payload = {
      issueID: issue_id,
      prAddresses: participants.map((items) => items.address),
      prAmounts: participants.map(
        (items) => (amountTotal * distrib[items.githubHandle]) / 100
      ),
    };
    setShow(false);

    const proposeMergeTx = addTransaction({type: TransactionTypes.proposeMerge})
    dispatch(proposeMergeTx);

    waitForMerge(githubLogin, issue_id, currentGithubId)
                      .then(() => {
                        if (handleBeproService)
                          handleBeproService(true);

                        if (handleMicroService)
                          handleMicroService(true);
                        handleClose();
                        setDistrib({});
                      })

    await BeproService.network
                      .proposeIssueMerge(payload)
                      .then(txInfo => {
                        processEvent(`merge-proposal`, txInfo.blockNumber, issue_id, currentGithubId);

                        txWindow.updateItem(proposeMergeTx.payload.id, BeproService.parseTransaction(txInfo, proposeMergeTx.payload));

                        handleClose();
                      })
                      .catch((e) => {
                        if (e?.message?.search(`User denied`) > -1)
                          dispatch(updateTransaction({...proposeMergeTx.payload as any, remove: true}))
                        else dispatch(updateTransaction({...proposeMergeTx.payload as any, status: TransactionStatus.failed}));
                        handleClose();
                      })                    
  }

  function handleClose() {
    if (pullRequests.length && activeRepo)
      getParticipantsPullRequest(pullRequests[0]?.id, pullRequests[0]?.githubId)
      setCurrentGithubId(pullRequests[0]?.githubId)

    setShow(false);
    setAmount(0);
    setDistrib({});
    handleInputColor("normal")
  }

  function handleChangeSelect({ value, githubId }) {
    setDistrib({});
    setAmount(0);
    getParticipantsPullRequest(value, githubId);
    handleInputColor("normal")
  }

  function recognizeAsFinished() {
    const recognizeAsFinished = addTransaction({type: TransactionTypes.recognizedAsFinish})
    dispatch(recognizeAsFinished);

    BeproService.network.getIssueByCID({issueCID: issueId})
                .then((_issue) => {
                  return BeproService.network.recognizeAsFinished({issueId: +_issue._id})
                })
                .then(txInfo => {
                  txWindow.updateItem(recognizeAsFinished.payload.id, BeproService.parseTransaction(txInfo, recognizeAsFinished.payload));
                })
                .then(() => {
                  if (handleBeproService)
                    handleBeproService(true);

                  if (handleMicroService)
                    handleMicroService(true);
                })
                .catch((e) => {
                  if (e?.message?.search(`User denied`) > -1)
                    dispatch(updateTransaction({...recognizeAsFinished.payload as any, remove: true}))
                  else dispatch(updateTransaction({...recognizeAsFinished.payload as any, status: TransactionStatus.failed}));
                  dispatch(toastWarning(t('bounty.errors.recognize-finished')));
                  console.error(`Failed to mark as finished`, e);
                })
  }

  function updateCreateProposalHideState() {
    if (!beproInit) return;

    BeproService.network.COUNCIL_AMOUNT().then(setCouncilAmount)
                .then(() => BeproService.network.isCouncil({address: currentAddress}))
                .then(isCouncil => setIsCouncil(isCouncil));
  }

  function renderRecognizeAsFinished() {
    return <Button onClick={recognizeAsFinished} className="mr-1">{t('bounty.actions.recognize-finished.title')}</Button>;
  }

  useEffect(() => {
    setAmount(sumObj(distrib));
  }, [distrib]);

  useEffect(() => {
    if (pullRequests.length && activeRepo){
      getParticipantsPullRequest(pullRequests[0]?.id, pullRequests[0]?.githubId);
      loadProposalsMeta()
    }
  }, [pullRequests, activeRepo]);

  useEffect(updateCreateProposalHideState, [currentAddress]);

  return (
    <div className="d-flex">
      {
        isCouncil && isFinished && <Button className="mx-2" onClick={() => setShow(true)}>Create Proposal</Button>
        || isIssueOwner && !isFinished && renderRecognizeAsFinished()
      }
      <Modal show={show}
             title={t('proposal.new')}
             titlePosition="center"
             onCloseClick={handleClose}
             footer={
               <>
                 <Button
                   onClick={handleClickCreate}
                   disabled={!currentAddress || participants.length === 0 || !success}>
                   {!currentAddress || participants.length === 0 || !success && <LockedIcon width={12} height={12} className="mr-1"/>}
                   <span >{t('proposal.actions.create')}</span>
                 </Button>

                 <Button color='dark-gray' onClick={handleClose}>
                   {t('actions.cancel')}
                 </Button>
               </>
             }>
        <p className="caption-small text-white-50 mb-2 mt-2">{t('pull-request.select')}</p>
        <ReactSelect id="pullRequestSelect"
                      isDisabled={participants.length === 0}
                     defaultValue={{
                       value: pullRequests[0]?.id,
                       label: `#${pullRequests[0]?.githubId} ${t('misc.by')} @${pullRequests[0].githubLogin}`,
                       githubId: pullRequests[0]?.githubId,
                     }}
                     options={pullRequests?.map((items: pullRequest) => ({
                       value: items.id,
                       label: `#${items.githubId} ${t('misc.by')} @${items.githubLogin}`,
                       githubId: items.githubId,
                     }))}
                     onChange={handleChangeSelect}/>
        {participants.length === 0 && <p className="text-uppercase text-danger text-center w-100 caption mt-4 mb-0">{t('status.network-congestion')}</p> || <>
          <p className="caption-small mt-3 text-white-50 text-uppercase mb-2 mt-3">{t('proposal.actions.propose-distribution')}</p>
          <ul className="mb-0">
            {participants.map((item) => (
                                <CreateProposalDistributionItem key={item.githubHandle}
                                                                by={item.githubHandle}
                                                                address={item.address}
                                                                onChangeDistribution={handleChangeDistrib}
                                                                defaultPercentage={0}
                                                                error={error}
                                                                success={success}
                                                                warning={warning}
                                                                />
                              )
            )}
          </ul>
          <div className="d-flex" style={{ justifyContent: "flex-end" }}>
              {warning ? (
                <p className="caption-small pr-3 mt-3 mb-0 text-uppercase text-warning">
                  {t('proposal.errors.distribution-already-exists')}
                </p>
              ) : (
                <p
                  className={clsx(
                    "caption-small pr-3 mt-3 mb-0  text-uppercase",
                    {
                      "text-success": success,
                      "text-danger": error,
                    }
                  )}
                >
                  {t(`proposal.messages.distribution-${success ? "is" : "must-be"}-100`)}
                </p>
              )}
            </div>
        </>}
      </Modal>
    </div>
  );
}
