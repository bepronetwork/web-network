import { useEffect, useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useRepos } from "contexts/repos";

import sumObj from "helpers/sumObj";

import { pullRequest } from "interfaces/issue-data";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useOctokit from "x-hooks/use-octokit";

import Avatar from "./avatar";
import Button from "./button";
import CreateProposalDistributionItem from "./create-proposal-distribution-item";
import Modal from "./modal";
import PullRequestLabels from "./pull-request-labels";
import ReactSelect from "./react-select";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";

interface participants {
  githubHandle: string;
  githubLogin: string;
  address?: string;
}

interface SameProposal {
  currentPrId: number;
  prAddressAmount: {
    amount: number;
    address: string;
  }[];
}

function SelectValueComponent({ innerProps, innerRef, ...rest }) {
  const data = rest.getValue()[0];

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="proposal__select-options d-flex align-items-center text-center p-small p-1"
    >
      <Avatar userLogin={data?.githubLogin} />
      <span className="ml-1 text-nowrap">{data?.label}</span>
      <div className="ms-2">
        <PullRequestLabels
          isMergeable={data.isMergeable}
          merged={data.merged}
        />
      </div>
    </div>
  );
}

function SelectOptionComponent({ innerProps, innerRef, data }) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="proposal__select-options d-flex align-items-center text-center p-small p-1"
    >
      <Avatar userLogin={data?.githubLogin} />
      <span
        className={`ml-1 text-nowrap ${
          data.isDisable ? "text-ligth-gray" : "text-gray hover-primary"
        }`}
      >
        {data?.label}
      </span>
      <div className="d-flex flex-grow-1 justify-content-end">
        <PullRequestLabels
          isMergeable={data.isMergeable}
          merged={data.merged}
        />
      </div>
    </div>
  );
}

export default function NewProposal({
  amountTotal,
  pullRequests = [],
  isIssueOwner = false,
  isFinished = false
}) {
  const { t } = useTranslation([
    "common",
    "bounty",
    "proposal",
    "pull-request"
  ]);

  const [show, setShow] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [distrib, setDistrib] = useState<object>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);
  const [currentGithubId, setCurrentGithubId] = useState<string>();
  const [participants, setParticipants] = useState<participants[]>([]);
  const [showExceptionalMessage, setShowExceptionalMessage] =
    useState<boolean>();
  const [currentPullRequest, setCurrentPullRequest] = useState<pullRequest>({} as pullRequest);

  const { activeRepo } = useRepos();
  const { wallet, beproServiceStarted } = useAuthentication();

  const { handleRecognizeAsFinished, handleProposeMerge } = useBepro({onSuccess})
  const { updateIssue, activeIssue, networkIssue } = useIssue()
  const { getParticipants } = useOctokit();
  const { getUserWith } = useApi();

  function onSuccess(){
    updateIssue(activeIssue.repository.id,activeIssue.githubId)
  }

  function handleChangeDistrib(params: { [key: string]: number }): void {
    setDistrib((prevState) => {
      handleCheckDistrib({
        ...prevState,
        ...params
      });
      return {
        ...prevState,
        ...params
      };
    });
  }

  function isSameProposal(currentDistrbuition: SameProposal,
                          currentProposals: SameProposal[]) {
    return currentProposals.some((activeProposal) => {
      if (activeProposal.currentPrId === currentDistrbuition.currentPrId) {
        return activeProposal.prAddressAmount.every((ap) =>
          currentDistrbuition.prAddressAmount.find((p) => ap.amount === p.amount && ap.address === p.address));
      } else {
        return false;
      }
    });
  }

  function handleCheckDistrib(obj: object) {
    const currentAmount = sumObj(obj);

    if (currentAmount === 100) {
      const { id } = pullRequests.find((data) => data.githubId === currentGithubId);

      const currentDistrbuition = {
        currentPrId: id,
        prAddressAmount: participants.map((item) => ({
          amount: (amountTotal * obj[item.githubHandle]) / 100,
          address: item.address.toLowerCase()
        }))
      };

      const currentProposals = networkIssue?.proposals?.map((item) => {
        return {
          currentPrId: Number(activeIssue?.mergeProposals.find(mp=> +mp.scMergeId === item.id).pullRequestId),
          prAddressAmount: item.details.map(detail => ({
            amount: Number(detail.percentage),
            address: detail.recipient
          }))
        };
      });

      if (isSameProposal(currentDistrbuition, currentProposals)) {
        handleInputColor("warning");
      } else {
        handleInputColor("success");
      }
    }
    if ((currentAmount > 0 && currentAmount < 100) || currentAmount > 100) {
      handleInputColor("error");
    }
    if (currentAmount === 0) {
      handleInputColor("normal");
    }

    if (currentAmount === 100) {
      participants.map((item) => {
        const realValue = (amountTotal * obj[item.githubHandle]) / 100;
        if (
          amountTotal < participants.length &&
          realValue < 1 &&
          realValue !== 0 &&
          realValue < amountTotal
        ) {
          handleInputColor("error");
          setShowExceptionalMessage(true);
        }
      });
    }
  }

  function handleInputColor(name: string) {
    if (name === "success") {
      setError(false);
      setSuccess(true);
      setWarning(false);
    }
    if (name === "error") {
      setError(true);
      setSuccess(false);
      setWarning(false);
    }
    if (name === "warning") {
      setError(false);
      setSuccess(false);
      setWarning(true);
    }
    if (name === "normal") {
      setError(false);
      setSuccess(false);
      setWarning(false);
    }
  }

  function getParticipantsPullRequest(githubId: string) {
    if (!activeRepo) return;

    getParticipants(+githubId, activeRepo.githubPath)
      .then((participants) => {
        const tmpParticipants = [...participants];

        pullRequests
          ?.find((pr) => pr.githubId === githubId)
          ?.reviewers?.forEach((participant) => {
            if (!tmpParticipants.includes(participant))
              tmpParticipants.push(participant);
          });

        return Promise.all(tmpParticipants.map(async (login) => {
          const { address, githubLogin, githubHandle } = await getUserWith(login);
          return { address, githubLogin, githubHandle };
        }));
      })
      .then((participantsPr) => {
        const tmpParticipants = participantsPr.filter(({ address }) => !!address);
        setDistrib(Object.fromEntries(tmpParticipants.map((participant) => [participant.githubHandle, 0])));
        setCurrentGithubId(githubId);
        setParticipants(tmpParticipants);
      })
      .catch((err) => {
        console.error("Error fetching pullRequestsParticipants", err);
      });
  }

  async function handleClickCreate(): Promise<void> {
    function handleValues(amount, distributed) {
      return Math.floor((amount * distributed) / 100);
    }

    const prAddresses: string[] = [];
    const prAmounts: number[] = [];

    participants.map((items) => {
      if (handleValues(amountTotal, distrib[items.githubHandle]) > 0) {
        prAddresses.push(items.address);
        prAmounts.push(handleValues(amountTotal, distrib[items.githubHandle]));
      }
    });

    //Chcking diff between total Distributed and total Ammount;
    const totalDistributed = prAmounts.reduce((p, c) => p + c);
    // Assigning the rest to last participant;
    prAmounts[prAmounts.length - 1] += Math.ceil(amountTotal - totalDistributed);

    handleProposeMerge(currentPullRequest.githubId, prAddresses, prAmounts)
    .finally(handleClose)
  }

  function handleClose() {
    if (pullRequests.length && activeRepo)
      getParticipantsPullRequest(pullRequests[0]?.githubId);
    setCurrentGithubId(pullRequests[0]?.githubId);

    setShow(false);
    setDistrib({});
    handleInputColor("normal");
  }

  function handleChangeSelect({ value, githubId }) {
    setDistrib({});
    const newPr = pullRequests.find((el) => el.id === value);
    if (newPr) {
      setCurrentPullRequest(newPr);
    }
    getParticipantsPullRequest(githubId);
    handleInputColor("normal");
  }

  function recognizeAsFinished() {
    handleRecognizeAsFinished().then(()=>{
      updateIssue(activeIssue.repository.id, activeIssue.githubId)
    })
  }

  function renderRecognizeAsFinished() {
    return (
      <ReadOnlyButtonWrapper>
        <Button onClick={recognizeAsFinished} className="read-only-button">
          {t("bounty:actions.recognize-finished.title")}
        </Button>
      </ReadOnlyButtonWrapper>
    );
  }
  const cantBeMergeable = () =>
    !currentPullRequest.isMergeable || currentPullRequest.merged;

  useEffect(() => {
    if (pullRequests.length && activeRepo && beproServiceStarted) {
      const defaultPr =
        pullRequests.find((el) => el.isMergeable) || pullRequests[0];
      setCurrentPullRequest(defaultPr);
      getParticipantsPullRequest(defaultPr?.githubId);
    }
  }, [pullRequests, activeRepo, beproServiceStarted]);

  return (
    <div className="d-flex">
      {(wallet?.isCouncil && isFinished && (
        <ReadOnlyButtonWrapper>
          <Button className="read-only-button" onClick={() => setShow(true)}>
            {t("proposal:actions.create")}
          </Button>
        </ReadOnlyButtonWrapper>
      )) ||
        <></>}
        {/* (isIssueOwner && !isFinished && renderRecognizeAsFinished())} */}
      <Modal
        show={show}
        title={t("proposal:actions.new")}
        titlePosition="center"
        onCloseClick={handleClose}
        footer={
          <>
            <Button
              onClick={handleClickCreate}
              disabled={
                !wallet?.address ||
                participants.length === 0 ||
                !success ||
                cantBeMergeable()
              }
            >
              {!wallet?.address ||
                participants.length === 0 ||
                (!success && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                ))}
              <span>{t("proposal:actions.create")}</span>
            </Button>

            <Button color="dark-gray" onClick={handleClose}>
              {t("actions.cancel")}
            </Button>
          </>
        }
      >
        <p className="caption-small text-white-50 mb-2 mt-2">
          {t("pull-request:select")}
        </p>
        <ReactSelect
          id="pullRequestSelect"
          isDisabled={participants.length === 0}
          components={{
            Option: SelectOptionComponent,
            ValueContainer: SelectValueComponent
          }}
          placeholder={t("forms.select-placeholder")}
          defaultValue={{
            value: currentPullRequest?.id,
            label: `PR#${currentPullRequest?.id} ${t("misc.by")} @${
              currentPullRequest?.githubLogin
            }`,
            githubId: currentPullRequest?.githubId,
            githubLogin: currentPullRequest?.githubLogin,
            marged: currentPullRequest?.merged,
            isMergeable: currentPullRequest?.isMergeable,
            isDisable: false
          }}
          options={pullRequests?.map((items: pullRequest) => ({
            value: items.id,
            label: `#${items.githubId} ${t("misc.by")} @${items.githubLogin}`,
            githubId: items.githubId,
            githubLogin: items.githubLogin,
            marged: items.merged,
            isMergeable: items.isMergeable,
            isDisable: items.merged || !items.isMergeable
          }))}
          isOptionDisabled={(option) => option.isDisable}
          onChange={handleChangeSelect}
        />
        {(participants.length === 0 && (
          <p className="text-uppercase text-danger text-center w-100 caption mt-4 mb-0">
            {t("status.network-congestion")}
          </p>
        )) || (
          <>
            <p className="caption-small mt-3 text-white-50 text-uppercase mb-2 mt-3">
              {t("proposal:actions.propose-distribution")}
            </p>
            <ul className="mb-0">
              {participants.map((item) => (
                <CreateProposalDistributionItem
                  key={item.githubHandle}
                  githubHandle={item.githubHandle}
                  githubLogin={item.githubLogin}
                  onChangeDistribution={handleChangeDistrib}
                  defaultPercentage={0}
                  error={!!error}
                  success={success}
                  warning={warning}
                  isDisable={cantBeMergeable()}
                />
              ))}
            </ul>
            <div className="d-flex" style={{ justifyContent: "flex-end" }}>
              {warning || cantBeMergeable() ? (
                <p
                  className={`caption-small pr-3 mt-3 mb-0 text-uppercase text-${
                    warning ? "warning" : "danger"
                  }`}
                >
                  {t(`proposal:errors.${
                      warning ? "distribution-already-exists" : "pr-cant-merged"
                    }`)}
                </p>
              ) : (
                <p
                  className={clsx("caption-small pr-3 mt-3 mb-0  text-uppercase",
                                  {
                      "text-success": success,
                      "text-danger": error
                                  })}
                >
                  {showExceptionalMessage && error
                    ? t("proposal:messages.distribution-cant-done")
                    : t(`proposal:messages.distribution-${
                          success ? "is" : "must-be"
                        }-100`)}
                </p>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
