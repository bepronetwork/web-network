import {useState} from "react";
import {components as RSComponents, SingleValueProps} from "react-select";

import BigNumber from "bignumber.js";
import clsx from "clsx";
import {useTranslation} from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Avatar from "components/avatar";
import Button from "components/button";
import ContractButton from "components/contract-button";
import CreateProposalDistributionItem from "components/create-proposal-distribution-item";
import Modal from "components/modal";
import PullRequestLabels from "components/pull-request/labels/controller";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import sumObj from "helpers/sumObj";

import {NetworkEvents} from "interfaces/enums/events";
import {IssueBigNumberData, PullRequest} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useOctokit from "x-hooks/use-octokit";

interface participants {
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

function SingleValue (props: SingleValueProps<any>) {
  const data = props.getValue()[0];
  return (
  <RSComponents.SingleValue {...props}>
    <div className="d-flex align-items-center p-1">
      <Avatar userLogin={data?.githubLogin} />
      <span className="ml-1 text-nowrap">{data?.label}</span>
      <div className="ms-2">
        <PullRequestLabels
          isMergeable={data.isMergeable}
          merged={data.merged}
          isDraft={data.isDraft}
        />
      </div>
      </div>
  </RSComponents.SingleValue>
  )}

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
          data.isDisable ? "text-light-gray" : "text-gray hover-primary"
        }`}
      >
        {data?.label}
      </span>
      <div className="d-flex flex-grow-1 justify-content-end">
        <PullRequestLabels
          isMergeable={data.isMergeable}
          merged={data.merged}
          isDraft={data.isDraft}
        />
      </div>
    </div>
  );
}

interface ProposalModalProps {
  amountTotal: BigNumber | string | number;
  pullRequests: PullRequest[];
  show: boolean;
  onCloseClick: () => void;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

export default function ProposalModal({
  amountTotal,
  pullRequests = [],
  show,
  onCloseClick,
  currentBounty,
  updateBountyData
}: ProposalModalProps) {
  const { t } = useTranslation([
    "common",
    "bounty",
    "proposal",
    "pull-request"
  ]);

  const [error, setError] = useState<boolean>(false);
  const [distrib, setDistrib] = useState<object>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [currentGithubId, setCurrentGithubId] = useState<string>();
  const [participants, setParticipants] = useState<participants[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState<boolean>(false);
  const [showExceptionalMessage, setShowExceptionalMessage] =
    useState<boolean>();
  const [currentPullRequest, setCurrentPullRequest] = useState<PullRequest>();
  const [showDecimalsError, setShowDecimalsError] = useState(false)

  const {state} = useAppState();

  const { handleProposeMerge } = useBepro();
  const { getPullRequestParticipants } = useOctokit();
  const { getUserWith, processEvent } = useApi();

  const bountyAmount = BigNumber(amountTotal);
  const proposerFeeShare = state.Service?.network?.amounts?.proposerFeeShare || 0;
  const mergeCreator = state.Service?.network?.amounts?.mergeCreatorFeeShare || 0;
  const treasury = state.Service?.network?.amounts?.treasury;

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

  function isSameProposal(currentDistrbuition: SameProposal, currentProposals: SameProposal[]) {
    return currentProposals.some((activeProposal) => {
      if (activeProposal.currentPrId === currentDistrbuition.currentPrId) {
        return activeProposal.prAddressAmount.every((ap) =>
          currentDistrbuition.prAddressAmount.find((p) =>
          ap.amount === p.amount && ap.address.toLowerCase() === p.address.toLowerCase()));
      } else {
        return false;
      }
    });
  }

  function handleCheckDistrib(obj: object) {
    const currentAmount = sumObj(obj);

    setShowDecimalsError(false);

    if (participants.some(p => obj[p?.githubLogin]%1 > 0)) {
      setShowDecimalsError(true);
      return;
    }

    if (currentAmount === 100) {
      const { id } = pullRequests.find((data) => data.githubId === currentGithubId);

      const currentDistrbuition = {
        currentPrId: id,
        prAddressAmount: participants.map((item) => ({
          amount: obj[item?.githubLogin],
          address: item.address.toLowerCase()
        }))
      };

      const currentProposals = currentBounty?.mergeProposals?.map((item) => {
        return {
          currentPrId: item.pullRequestId,
          prAddressAmount: item.distributions.map(distribution => ({
            amount: distribution.percentage,
            address: distribution.recipient
          }))
        };
      });

      if (isSameProposal(currentDistrbuition, currentProposals)) {
        handleInputColor("warning");
      } else {
        handleInputColor("success");
      }

      const proposalDetails =
        currentDistrbuition.prAddressAmount.map(({ amount, address }) => ({ percentage: amount, recipient: address }));

      const distributedAmounts =
        calculateDistributedAmounts(treasury, mergeCreator, proposerFeeShare, bountyAmount, proposalDetails);

      if (distributedAmounts.proposals.some(({ value, percentage }) =>
        BigNumber(value).lt(1e-15) && BigNumber(percentage).gt(0))) {
        handleInputColor("error");
        setShowExceptionalMessage(true);
      }
    }

    if ((currentAmount > 0 && currentAmount < 100) || currentAmount > 100) {
      handleInputColor("error");
    }
    if (currentAmount === 0) {
      handleInputColor("normal");
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
    if (!state.Service?.network?.repos?.active || !state.Settings?.github?.botUser) return;

    setIsLoadingParticipants(true);

    getPullRequestParticipants(state.Service?.network?.repos?.active.githubPath, +githubId)
      .then((participants) => {
        const tmpParticipants =
          participants.filter(p => p.toLowerCase() !== state.Settings.github.botUser.toLowerCase());

        pullRequests
          ?.find((pr) => pr.githubId === githubId)
          ?.reviewers?.forEach((participant) => {
            if (!tmpParticipants.includes(participant))
              tmpParticipants.push(participant);
          });

        return Promise.all(tmpParticipants.map(async (login) => {
          const { address, githubLogin } = await getUserWith(login);
          return { address, githubLogin };
        }));
      })
      .then((participantsPr) => {
        const tmpParticipants = participantsPr.filter(({ address }) => !!address);
        setDistrib(Object.fromEntries(tmpParticipants.map((participant) => [participant?.githubLogin || '', 0])));
        setCurrentGithubId(githubId);
        setParticipants([])
        setParticipants(tmpParticipants);
      })
      .catch((err) => {
        console.error("Error fetching pullRequestsParticipants", err);
      })
      .finally(() => setIsLoadingParticipants(false))
  }

  async function handleClickCreate(): Promise<void> {
    const prAddresses: string[] = [];
    const prAmounts: number[] = [];

    participants.map((items) => {
      if (distrib[items?.githubLogin] > 0) {
        prAddresses.push(items.address);
        prAmounts.push(distrib[items?.githubLogin]);
      }
    });

    setExecuting(true);

    handleProposeMerge(+currentBounty.contractId, +currentPullRequest.contractId, prAddresses, prAmounts)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

      return processEvent(NetworkEvents.ProposalCreated, undefined, { fromBlock });
    })
    .then(() => {
      handleClose();
      setExecuting(false);
      updateBountyData();
    })
  }

  function handleClose() {
    if (pullRequests.length && state.Service?.network?.repos?.active)
      getParticipantsPullRequest(pullRequests[0]?.githubId);
    setCurrentGithubId(pullRequests[0]?.githubId);

    onCloseClick();
    setDistrib({});
    handleInputColor("normal");
    setShowDecimalsError(false);
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

  const cantBeMergeable = () => !currentPullRequest.isMergeable || currentPullRequest.merged;

  function pullRequestToOption(pr) {
    if (!pr) return;

    return {
      value: pr?.id,
      label: `PR #${pr?.githubId} ${t("misc.by")} @${pr?.githubLogin}`,
      githubId: pr?.githubId,
      githubLogin: pr?.githubLogin,
      marged: pr?.merged,
      isMergeable: pr?.isMergeable,
      isDraft: pr?.status === "draft",
      isDisable: pr?.merged || !pr?.isMergeable || pr?.status === "draft"
    }
  }

  // useEffect(() => {
  //   if (pullRequests.length && state.Service?.network?.repos?.active && state.Settings?.github?.botUser) {
  //     const defaultPr =
  //       pullRequests.find((el) => el.isMergeable) || pullRequests[0];
  //     setCurrentPullRequest(defaultPr);
  //     getParticipantsPullRequest(defaultPr?.githubId);
  //   }
  // }, [pullRequests, state.Service?.network?.repos?.active, state.Settings?.github?.botUser]);


  function renderDistribution() {
    if (!currentPullRequest?.id)
      return <></>;

    if (isLoadingParticipants)
      return (
      <div className="d-flex justify-content-center mt-4">
        <span className="spinner-border spinner-border-md" />
      </div>
      );

    if (!participants.length)
      return (
        <p className="text-uppercase text-danger text-center w-100 caption mt-4 mb-0">
          {t("pull-request:errors.pull-request-participants")}
        </p>
      );

    return (
      <>
        <p className="caption-small mt-3 text-white-50 text-uppercase mb-2 mt-3">
          {t("proposal:actions.propose-distribution")}
        </p>
        <ul className="mb-0">
          {participants.map((item) => (
            <CreateProposalDistributionItem
              key={`distribution-item-${item.githubLogin}`}
              githubLogin={item.githubLogin}
              onChangeDistribution={handleChangeDistrib}
              error={!!error}
              success={success}
              warning={warning}
              isDisable={cantBeMergeable()}
            />
          ))}
        </ul>

        {
          showDecimalsError &&
          <div className="d-flex caption-small text-uppercase mt-3 justify-content-end text-warning">
            {t('proposal:messages.no-decimals-supported')}
          </div>
        }
        {!showDecimalsError &&
          <div className="d-flex" style={{justifyContent: "flex-end"}}>
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
                className={clsx("caption-small pr-3 mt-3 mb-0  text-uppercase", {
                  "text-success": success,
                  "text-danger": error,
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
        }
      </>
    );
  }


  return (
    <div className="d-flex">
      <Modal
        show={show}
        title={t("proposal:actions.new")}
        titlePosition="center"
        onCloseClick={handleClose}
        footer={
          <div className="d-flex justify-content-between">
            <Button color="dark-gray" onClick={handleClose}>
              {t("actions.cancel")}
            </Button>
            <ContractButton
              onClick={handleClickCreate}
              disabled={!state.currentUser?.walletAddress ||
                participants.length === 0 ||
                !success ||
                executing ||
                cantBeMergeable()}
              isLoading={executing}
            >
              {!state.currentUser?.walletAddress ||
                participants.length === 0 ||
                executing ||
                (!success && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                ))}
              <span>{t("proposal:actions.create")}</span>
            </ContractButton>
          </div>
        }>
        <p className="caption-small text-white-50 mb-2 mt-2">
          {t("pull-request:select")}
        </p>
        <ReactSelect
          id="pullRequestSelect"

          components={{
            Option: SelectOptionComponent,
            SingleValue
          }}
          placeholder={t("forms.select-placeholder")}
          value={pullRequestToOption(currentPullRequest)}
          options={pullRequests?.map(pullRequestToOption)}
          isOptionDisabled={(option) => option.isDisable}
          onChange={handleChangeSelect}
          isSearchable={false}
        />
          {renderDistribution()}
      </Modal>
    </div>
  );
}
