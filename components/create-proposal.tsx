import {useContext, useEffect, useState} from 'react';
import Modal from "./modal";
import ReactSelect from "./react-select";
import CreateProposalDistributionItem from "./create-proposal-distribution-item";
import sumObj from "helpers/sumObj";
import { BeproService } from '@services/bepro-service';
import GithubMicroService from "../services/github-microservice";
import { pullRequest } from "interfaces/issue-data";
import {ApplicationContext} from '@contexts/application';

interface participants {
  githubHandle: string;
  address?: string;
}

export default function NewProposal({
  issueId,
  amountTotal,
  pullRequests = [],
}) {
  const {state: {balance}} = useContext(ApplicationContext);
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>();
  const [error, setError] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [participants, setParticipants] = useState<participants[]>([]);
  const [hideCreateProposal, setHideCreateProposal] = useState(true);
  const [councilAmount, setCouncilAmount] = useState(0);

  function handleChangeDistrib(params: { [key: string]: number }): void {
    console.log("params->", params);
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }

  function getParticipantsPullRequest(id: string) {
    GithubMicroService.getPullRequestParticipants(id)
      .then((participantsPr) => setParticipants(participantsPr))
      .catch((err) => console.log("err", err));
  }

  async function handleClickCreate(): Promise<void> {
    if (amount > 0 && amount < 100) {
      return setError(`${100 - amount}% is missing!`);
    }
    if (amount === 0) {
      return setError("Distribution must be equal to 100%.");
    }
    if (amount > 100) {
      return setError("Distribution exceed 100%.");
    }

    const payload = {
      issueID: issueId,
      prAddresses: participants.map((items) => items.address),
      prAmounts: participants.map(
        (items) => (amountTotal * distrib[items.githubHandle]) / 100
      ),
    };
    await BeproService.network
      .proposeIssueMerge(payload)
      .then(() => {
        handleClose();
        setDistrib({});
      })
      .catch((err) => {
        setError(err);
        console.log("err", err);
      });
  }

  function handleClose() {
    setShow(false);
  }

  function handleChangeSelect(obj: { label: string; value: string }) {
    getParticipantsPullRequest(obj.value);
  }

  function updateHideCreateProposalState() {
    setHideCreateProposal(councilAmount > balance.bepro);
  }

  function getCouncilAmount() {
    BeproService.network.COUNCIL_AMOUNT().then(setCouncilAmount);
  }

  useEffect(() => {
    setError("");
    setAmount(sumObj(distrib));
  }, [distrib]);

  useEffect(() => {
    if (pullRequests.length)
      getParticipantsPullRequest(pullRequests[0]?.id);
  }, [pullRequests]);

  useEffect(getCouncilAmount, []);
  useEffect(updateHideCreateProposalState, [balance.bepro]);

  return (
    <> {!hideCreateProposal && <button className="btn btn-md btn-primary" onClick={() => setShow(true)}>Create Proposal</button> || `You need at least ${councilAmount}BEPRO to Create a Proposal`}

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
            >
              Create Proposal
            </button>
          </>
        }>
        <p className="p-small text-50">Select a pull request </p>
        <ReactSelect
          defaultValue={{
            value: pullRequests[0]?.id,
            label: `#${pullRequests[0]?.githubId} Pull Request`,
          }}
          options={pullRequests?.map((items: pullRequest) => ({
            value: items.id,
            label: `#${items.githubId} Pull Request`,
          }))}
          onChange={handleChangeSelect}
        />
        <p className="p-small mt-3">Propose distribution</p>
        <ul className="mb-0">
          {participants.map((item) => (
            <CreateProposalDistributionItem
              key={item.githubHandle}
              by={item.githubHandle}
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
