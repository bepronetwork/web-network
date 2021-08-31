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
                                    }) {
  const {dispatch, state: {balance, currentAddress, beproInit},} = useContext(ApplicationContext);
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>();
  const [error, setError] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [participants, setParticipants] = useState<participants[]>([]);
  const [hideCreateProposal, setHideCreateProposal] = useState(true);
  const [councilAmount, setCouncilAmount] = useState(0);
  const [currentGithubId, setCurrentGithubId] = useState<string>();

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
                      .catch((err) => console.log('err', err));
  }

  async function handleClickCreate(): Promise<void> {
    if (amount > 0 && amount < 100)
      return setError(`${100 - amount}% is missing!`);

    if (amount === 0)
      return setError('Distribution must be equal to 100%.');

    if (amount > 100)
      return setError('Distribution exceed 100%.');

    const payload = {
      issueID: issueId,
      prAddresses: participants.map((items) => items.address),
      prAmounts: participants.map(
        (items) => (amountTotal * distrib[items.githubHandle]) / 100
      ),
    };

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
                                scMergeId: (numberMergeProposals + 1).toString(),
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

  function handleChangeSelect(obj: {
    label: string;
    value: string;
    githubId: string;
  }) {
    getParticipantsPullRequest(obj.value, obj.githubId);
  }

  function updateHideCreateProposalState() {
    setHideCreateProposal(councilAmount > balance.staked);
  }

  function getCouncilAmount() {
    if (!beproInit) return;

    BeproService.network.COUNCIL_AMOUNT().then(setCouncilAmount);
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

  useEffect(getCouncilAmount, [beproInit]);
  useEffect(updateHideCreateProposalState, [balance.bepro]);

  return (
    <>
      {' '}
      {(!hideCreateProposal && (
        <button className="btn btn-md btn-primary" onClick={() => setShow(true)}>Create Proposal</button>
      )) ||
      ` You need at least ${councilAmount} BEPRO to Create a Proposal `}
      <Modal
        show={show}
        title="Create Proposal"
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-md btn-primary"
              onClick={handleClickCreate}
              disabled={!currentAddress}
            >
              Create Proposal
            </button>
          </>
        }
      >
        <p className="p-small text-50">Select a pull request </p>
        <ReactSelect
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
          onChange={handleChangeSelect}
        />
        <p className="p-small mt-3">Propose distribution</p>
        <ul className="mb-0">
          {participants.map((item) => (
            <CreateProposalDistributionItem
              key={item.githubHandle}
              by={item.githubHandle}
              address={item.address}
              onChangeDistribution={handleChangeDistrib}
              error={error}
            />
          ))}
        </ul>
        {error && <p className="p error mt-3 mb-0 text-danger">{error}</p>}
      </Modal>
    </>
  );
}
