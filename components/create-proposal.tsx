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

interface participants {
  githubHandle: string;
  address?: string;
}

export default function NewProposal({
                                      issueId,
                                      amountTotal,
                                      numberMergeProposals,
                                      pullRequests = [],
                                      handleBeproService,
                                      handleMicroService,
                                      isIssueOwner = false, isFinished = false
                                    }) {
  const {dispatch, state: {balance, currentAddress, beproInit, oracles, githubLogin},} = useContext(ApplicationContext);
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>();
  const [error, setError] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [participants, setParticipants] = useState<participants[]>([]);
  const [isCouncil, setIsCouncil] = useState(false);
  const [councilAmount, setCouncilAmount] = useState(0);
  const [currentGithubId, setCurrentGithubId] = useState<string>();
  const router = useRouter();
  const [[activeRepo]] = useRepos();
  const {getParticipants} = useOctokit();
  const {getUserWith, waitForMerge, processMergeProposal, processEvent} = useApi();
  const txWindow = useTransactions();


  function handleChangeDistrib(params: { [key: string]: number }): void {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
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
    if (amount > 0 && amount < 100)
      return setError(`${100 - amount}% is missing!`);

    if (amount === 0)
      return setError('Distribution must be equal to 100%.');

    if (amount > 100)
      return setError('Distribution exceed 100%.');

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
  }

  function handleChangeSelect({ value, githubId }) {
    setDistrib({});
    setAmount(0);
    getParticipantsPullRequest(value, githubId);
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
                  dispatch(toastWarning(`Failed to mark bounty as finished!`));
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
    setError('');
    setAmount(sumObj(distrib));
  }, [distrib]);

  useEffect(() => {
    if (pullRequests.length && activeRepo)
      getParticipantsPullRequest(pullRequests[0]?.id, pullRequests[0]?.githubId);
  }, [pullRequests, activeRepo]);

  useEffect(updateCreateProposalHideState, [currentAddress]);

  return (
    <>
      {
        isCouncil && isFinished && <Button onClick={() => setShow(true)}>Create Proposal</Button>
        || isIssueOwner && !isFinished && renderRecognizeAsFinished()
      }

      <Modal show={show}
             title="Create Proposal"
             footer={
               <>
                 <Button color='dark-gray' onClick={handleClose}>
                   Cancel
                 </Button>
                 <Button
                   onClick={handleClickCreate}
                   disabled={!currentAddress || participants.length === 0}>
                   {participants.length === 0 && <LockedIcon width={12} height={12} className="mr-1"/>}
                   Create Proposal
                 </Button>
               </>
             }>
        <p className="p-small text-50">Select a pull request </p>
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
          <p className="p-small mt-3">Propose distribution</p>
          <ul className="mb-0">
            {participants.map((item) => (
                                <CreateProposalDistributionItem key={item.githubHandle}
                                                                by={item.githubHandle}
                                                                address={item.address}
                                                                onChangeDistribution={handleChangeDistrib}
                                                                defaultPercentage={participants?.length > 1 && (100 / participants.length) || 100}
                                                                error={error}/>
                              )
            )}
          </ul>
          {error && <p className="p error mt-3 mb-0 text-danger">{error}</p> ||
          <p className="mt-3 mb-0 text-white-50">Distribute reward percentage</p>}
        </>}
      </Modal>
    </>
  );
}
