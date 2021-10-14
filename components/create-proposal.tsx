import {useContext, useEffect, useState} from 'react';
import Modal from './modal';
import ReactSelect from './react-select';
import CreateProposalDistributionItem from './create-proposal-distribution-item';
import sumObj from 'helpers/sumObj';
import {BeproService} from '@services/bepro-service';
import GithubMicroService from '../services/github-microservice';
import {pullRequest} from 'interfaces/issue-data';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@contexts/reducers/change-load-state';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';
import {toastWarning} from '@reducers/add-toast';
import Button from './button';
import {useRouter} from 'next/router';

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
  const router = useRouter()


  function handleChangeDistrib(params: { [key: string]: number }): void {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }

  function getParticipantsPullRequest(id: string, githubId: string) {
    GithubMicroService.getPullRequestParticipants(id)
                      .then((participantsPr) => {
                        setCurrentGithubId(githubId);
                        setParticipants(participantsPr);
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

    await BeproService.network
                      .proposeIssueMerge(payload)
                      .then(txInfo => {
                        BeproService.parseTransaction(txInfo, proposeMergeTx.payload)
                                    .then(block => dispatch(updateTransaction(block)));
                      })
                      .then(() =>
                              GithubMicroService.createMergeProposal(issueId, {
                                pullRequestGithubId: currentGithubId,
                                scMergeId: numberMergeProposals.toString(),
                                githubLogin,
                              }).then(() => {
                                handleBeproService();
                                handleMicroService();
                                handleClose();
                                setDistrib({});
                              })
                                                .then(() => {
                                                  handleClose();
                                                  setDistrib({});
                                                })
                                                .catch(() => setError('Error to create proposal in MicroService'))
                      )
                      .catch(() => {
                        dispatch(updateTransaction({...proposeMergeTx.payload as any, remove: true}))
                        setError('Error to create proposal in Smart Contract')
                      })
  }

  function handleClose() {
    setShow(false);
  }

  function handleChangeSelect({ value, githubId }) {
    getParticipantsPullRequest(value, githubId);
  }

  function recognizeAsFinished() {
    const recognizeAsFinished = addTransaction({type: TransactionTypes.recognizedAsFinish})
    dispatch(recognizeAsFinished);

    BeproService.network.getIssueByCID({issueCID: issueId})
                .then((issue) => {
                  return BeproService.network.recognizeAsFinished({issueId: issue._id}).catch(console.error)

                })
                .then(txInfo => {
                  BeproService.parseTransaction(txInfo, recognizeAsFinished.payload)
                              .then(block => dispatch(updateTransaction(block)));
                })
                .then(() => {
                  handleBeproService();
                  handleMicroService();
                })
                .catch((e) => {
                  dispatch(updateTransaction({...recognizeAsFinished.payload as any, remove: true}))
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
    return <Button onClick={() => recognizeAsFinished()}>Recognize as finished</Button>;
  }

  useEffect(() => {
    setError('');
    setAmount(sumObj(distrib));
  }, [distrib]);

  useEffect(() => {
    if (pullRequests.length)
      getParticipantsPullRequest(
        pullRequests[0]?.id,
        pullRequests[0]?.githubId
      );
  }, [pullRequests]);

  useEffect(updateCreateProposalHideState, [currentAddress]);

  return (
    <>
      {
        isCouncil && isFinished && <Button className="mx-1" onClick={() => setShow(true)}>Create Proposal</Button>
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
                   disabled={!currentAddress}>
                   Create Proposal
                 </Button>
               </>
             }>
        <p className="p-small text-50">Select a pull request </p>
        <ReactSelect id="pullRequestSelect"
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

        <p className="p-small mt-3">Propose distribution</p>
        <ul className="mb-0">
          {participants.map((item) => (
                              <CreateProposalDistributionItem key={item.githubHandle}
                                                              by={item.githubHandle}
                                                              address={item.address}
                                                              onChangeDistribution={handleChangeDistrib}
                                                              error={error}/>
                            )
          )}
        </ul>
        {error && <p className="p error mt-3 mb-0 text-danger">{error}</p> ||
        <p className="mt-3 mb-0 text-white-50">Distribute reward percentage</p>}
      </Modal>
    </>
  );
}
