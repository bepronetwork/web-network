import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import GithubLink from "components/github-link";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { IActiveIssue, useIssue } from "contexts/issue";
import { addToast } from "contexts/reducers/add-toast";

import { pullRequest } from "interfaces/issue-data";
import { INetworkProposal, Proposal } from "interfaces/proposal";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";

interface IMergeableModalProps {
  issue: IActiveIssue;
  issuePRs: pullRequest[];
  proposal: Proposal;
  pullRequest: pullRequest;
  networkProposal: INetworkProposal;
}
export default function NotMergeableModal({
  proposal,
  issuePRs,
  pullRequest,
  networkProposal
}: IMergeableModalProps) {
  const { t } = useTranslation("common");
  const { activeIssue, networkIssue } = useIssue();
  //TODO: Move to AuthContext
  const [isCouncil, setIsCouncil] = useState<boolean>(false);

  const {
    dispatch,
    state: { currentAddress, githubLogin }
  } = useContext(ApplicationContext);

  const [isVisible, setVisible] = useState(false);
  const [mergeState, setMergeState] = useState("");

  const { network } = useNetwork();
  const { mergeClosedIssue } = useApi();

  const isIssueOwner = activeIssue?.creatorGithub === githubLogin;
  const isPullRequestOwner = pullRequest?.githubLogin === githubLogin;
  const isProposer =
    networkProposal?.proposalAddress?.toLowerCase() === currentAddress;
  const hasPRMerged = !!pullRequest?.merged;

  const whenNotShow = [
    hasPRMerged, // Already exists a Pull Request merged to this bounty.
    pullRequest?.isMergeable && !networkIssue?.finalized, // The Pull Request was not merged year and the bounty is open.
    !(isIssueOwner || isPullRequestOwner || isCouncil || isProposer), // The user is not the bounty creator, nor the pull request creator,
    // nor the proposal creator and is not a council member.
    (isIssueOwner || isCouncil || isProposer) &&
      !isPullRequestOwner &&
      !networkIssue?.finalized // The bounty creator, proposal creator and council members can view only if the bounty was closed.
  ].some((values) => values);

  function handleModalVisibility() {
    if (!pullRequest || !issuePRs?.length || mergeState === "success") return;

    if (whenNotShow) {
      setVisible(false);
    } else if (isIssueOwner || isPullRequestOwner || isCouncil || isProposer) {
      setVisible(pullRequest.state === "open");
    }
  }

  function handleRetryMerge() {
    if (mergeState == "error") return false;

    setMergeState("loading");

    mergeClosedIssue(activeIssue?.issueId,
                     pullRequest?.githubId,
                     proposal?.scMergeId,
                     currentAddress,
                     network?.name)
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
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error.response.data.message
        }));

        setMergeState("error");
      });
  }

  useEffect(() => {
    //TODO: Move to AuthContext
    BeproService.network
      .isCouncil(currentAddress)
      .then((isCouncil) => setIsCouncil(isCouncil));
  }, [currentAddress]);

  useEffect(handleModalVisibility, [
    activeIssue,
    issuePRs,
    isCouncil,
    mergeState,
    pullRequest,
    networkProposal,
    networkIssue,
    currentAddress,
    githubLogin
  ]);

  return (
    <Modal
      show={isVisible}
      title={t("modals.not-mergeable.title")}
      titlePosition="center"
      onCloseClick={() => setVisible(false)}
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center m-2 text-center">
          <p className="h4 mb-2 text-white">
            {(networkIssue?.finalized &&
              t("modals.not-mergeable.closed-bounty")) ||
              ""}

            {(!networkIssue?.finalized &&
              t("modals.not-mergeable.open-bounty")) ||
              ""}
          </p>
        </div>
        <div className="d-flex justify-content-center">
          {isCouncil && networkIssue?.finalized && (
            <Button
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
            </Button>
          )}
          {isPullRequestOwner && (
            <GithubLink
              forcePath={activeIssue?.repository?.githubPath}
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
