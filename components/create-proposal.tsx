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

interface participants {
  githubHandle: string;
  address?: string;
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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
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

  function handleCheckDistrib(obj: object) {
    var currentAmount = sumObj(obj)
    if (currentAmount === 100){
     const { id }  = pullRequests.find(
        (data) => data.githubId === currentGithubId
      )
      var currentDistrbuition = {
        currentPrId: id,
        prAmounts: participants.map(
          (items) =>  ((amountTotal * obj[items.githubHandle])/100).toString()
        )
      }
      const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      if(
        proposals.find(
          (data) =>
            equals(currentDistrbuition.prAmounts, data.prAmounts) === true &&
            data.pullRequestId === currentDistrbuition.currentPrId
        )
      ){
        setWarning(' ')
        setError('')
        setSuccess('')
      }else {
        setError('')
        setSuccess(' ')
        setWarning('')
      } 
   }
   if (currentAmount > 0 && currentAmount < 100){
      //setError(`${100 - currentAmount}% is missing!`);
     setError(' ')
     setSuccess('')
     setWarning('')
   }
   if (currentAmount === 0){
      setError('');
      setSuccess('')
      setWarning('')
   }
   if (currentAmount > 100){
      setError(' ') 
      setSuccess('')
      setWarning('')
   }
  }

  function getParticipantsPullRequest(id: string, githubId: string) {
    if (!activeRepo)
      return;

    getParticipants(+githubId, activeRepo.githubPath)
      .then(participants => {
        return Promise.all(participants.map(async login => {
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
                        setError('Error to create proposal in Smart Contract')
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
    setError('');
    setSuccess('');
    setWarning('');
  }

  function handleChangeSelect({ value, githubId }) {
    setDistrib({});
    setAmount(0);
    getParticipantsPullRequest(value, githubId);
    setError('');
    setSuccess('');
    setWarning('');
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
                  dispatch(toastWarning(`Failed to mark issue as finished!`));
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
    return <Button onClick={recognizeAsFinished}>Recognize as finished</Button>;
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
             title="New Proposal"
             titlePosition="center"
             onCloseClick={handleClose}
             footer={
               <>
                 <Button
                   onClick={handleClickCreate}
                   disabled={!currentAddress || participants.length === 0 || !success}>
                   {!currentAddress || participants.length === 0 || !success && <LockedIcon width={12} height={12} className="mr-1"/>}
                   <span >Create Proposal</span>
                 </Button>
                 <Button color='dark-gray' onClick={handleClose}>
                   Cancel
                 </Button>
               </>
             }>
        <p className="smallCaption text-white-50 text-uppercase">Select a pull request </p>
        <ReactSelect id="pullRequestSelect"
                      isDisabled={participants.length === 0}
                     defaultValue={{
                       value: pullRequests[0]?.id,
                       label: `#${pullRequests[0]?.githubId} Pull Request`,
                       githubId: pullRequests[0]?.githubId,
                     }}
                     options={pullRequests?.map((items: pullRequest) => ({
                       value: items.id,
                       label: `#${items.githubId} Pull Request`,
                       githubId: items.githubId,
                     }))}
                     onChange={handleChangeSelect}/>
        {participants.length === 0 && <p className="text-uppercase text-danger text-center w-100 caption mt-4 mb-0">Network Congestion</p> || <>
          <p className="smallCaption mt-3 text-white-50 text-uppercase">Propose distribution</p>
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
                <p className="smallCaption pr-3 mt-3 mb-0 text-uppercase text-warning">
                  This distribution already existis on another proposal
                </p>
              ) : (
                <p
                  className={clsx(
                    "smallCaption pr-3 mt-3 mb-0  text-uppercase",
                    {
                      "text-success": success,
                      "text-danger": error,
                    }
                  )}
                >
                  Distribution {success ? "is" : "Must be"} 100%
                </p>
              )}
            </div>
        </>}
      </Modal>
    </div>
  );
}
