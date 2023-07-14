import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import GithubLink from "components/github-link";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {addToast} from "contexts/reducers/change-toaster";

import {PullRequest} from "interfaces/issue-data";
import {Proposal} from "interfaces/proposal";

import useApi from "x-hooks/use-api";

interface MergeableModalProps {
  proposal: Proposal;
  pullRequest: PullRequest;
}

export default function NotMergeableModal({
  proposal,
  pullRequest
}: MergeableModalProps) {
  const { t } = useTranslation("common");

  const {
    dispatch
  } = useAppState();

  const [isVisible, setVisible] = useState(false);
  const [mergeState, setMergeState] = useState("");

  const {state} = useAppState();

  const { mergeClosedIssue } = useApi();

  const isIssueOwner = !!state.currentBounty?.data && 
    state.currentBounty?.data?.creatorAddress === state.currentUser?.walletAddress;
  const isPullRequestOwner = pullRequest?.githubLogin === state.currentUser?.login;
  const isProposer = proposal?.creator === state.currentUser?.walletAddress;
  const hasPRMerged = !!pullRequest?.merged;

  const whenNotShow = [
    hasPRMerged, // Already exists a Pull Request merged to this bounty.
    pullRequest?.isMergeable && !state.currentBounty?.data?.isClosed, // The Pull Request was not merged year and the bounty is open.
    !(isIssueOwner || isPullRequestOwner || state.Service?.network?.active?.isCouncil || isProposer), // The user is not the bounty creator, nor the pull request creator,
    // nor the proposal creator and is not a council member.
    (isIssueOwner || state.Service?.network?.active?.isCouncil || isProposer) &&
      !isPullRequestOwner &&
      !state.currentBounty?.data?.isClosed, // The bounty creator, proposal creator and council members can view only if the bounty was closed.
    state.Service?.network?.active?.allowMerge === false
  ].some((values) => values);

  function handleRetryMerge() {
    if (mergeState === "error") return false;

    setMergeState("loading");

    mergeClosedIssue({
      issueId: state.currentBounty?.data?.issueId,
      pullRequestId: pullRequest?.githubId,
      mergeProposalId: proposal?.contractId,
      address: state.currentUser?.walletAddress, // todo: make sure what "address" and "wallet" mean
      networkName: state.Service?.network?.active?.name,
      wallet: state.currentUser?.walletAddress
    })
      .then(() => {
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("modals.not-mergeable.success-message")
        }));

        setMergeState("success");
        setVisible(false);
      })
      .catch((error) => {
        console.log("Failed to retry merge", error);

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error.response.data.message
        }));

        setMergeState("error");
      });
  }

  useEffect(() => {
    if (!pullRequest?.state || !state.currentBounty?.data?.pullRequests?.length || mergeState === "success") return;

    if (whenNotShow) {
      setVisible(false);
    } else if (isIssueOwner || isPullRequestOwner || state.Service?.network?.active?.isCouncil || isProposer) {
      setVisible(pullRequest.state.toLowerCase() === "open");
    }
  }, [
    state.currentBounty?.data,
    mergeState,
    pullRequest,
    state.currentUser?.walletAddress,
    state.currentUser?.login,
    state.Service?.network?.active?.isCouncil
  ]);

  return (
    <Modal
      show={isVisible}
      title={t("modals.not-mergeable.title")}
      titlePosition="center"
      onCloseClick={() => setVisible(false)}
      centerTitle>
      <div>
        <div className="d-flex justify-content-center m-2 text-center">
          <p className="h4 mb-2 text-white">
            {(state.currentBounty?.data?.isClosed &&
              t("modals.not-mergeable.closed-bounty")) ||
              ""}

            {(!state.currentBounty?.data?.isClosed &&
              t("modals.not-mergeable.open-bounty")) ||
              ""}
          </p>
        </div>
        <div className="d-flex justify-content-center">
          {state.Service?.network?.active?.isCouncil && state.currentBounty?.data?.isClosed && (
            <ContractButton
              color={`${
                (mergeState === "error" && "transparent") || "primary"
              }`}
              textClass={`${
                (mergeState === "error" && "text-danger") || undefined
              }`}
              disabled={mergeState !== ""}
              onClick={handleRetryMerge}
            >
              <span className="text-nowrap">
                {mergeState === "error"
                  ? t("modals.not-mergeable.merge-failed")
                  : t("modals.not-mergeable.retry-merge")}
              </span>
              {mergeState === "loading" && (
                <span className="spinner-border spinner-border-xs ml-1" />
              )}
            </ContractButton>
          )}
          {isPullRequestOwner && (
            <GithubLink
              forcePath={state.currentBounty?.data?.repository?.githubPath}
              hrefPath={`pull/${pullRequest?.githubId || ""}/conflicts`}
              color="primary"
            >
              {t("modals.not-mergeable.go-to-pr")}
            </GithubLink>
          )}
          <Button color="dark-gray" onClick={() => setVisible(false)}>
            {t("actions.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
