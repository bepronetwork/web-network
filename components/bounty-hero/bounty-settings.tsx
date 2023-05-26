import {
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { useTranslation } from "next-i18next";

import ArrowUpRight from "assets/icons/arrow-up-right";

import Modal from "components/modal";
import Translation from "components/translation";

import { useAppState } from "contexts/app-state";

import { getIssueState } from "helpers/handleTypeIssue";

import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import { useBounty } from "x-hooks/use-bounty";

export default function BountySettings({
  handleEditIssue,
  isEditIssue,
}: {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
}) {
  const node = useRef();
  const [show, setShow] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [isCancelable, setIsCancelable] = useState(false);
  const [showHardCancelModal, setShowHardCancelModal] = useState(false);
  const { state } = useAppState();
  const { t } = useTranslation(["common", "pull-request", "bounty"]);
  const { handleReedemIssue, handleHardCancelBounty } = useBepro();
  const { updateWalletBalance } = useAuthentication();
  const { getDatabaseBounty } = useBounty();

  const issueGithubID = state.currentBounty?.data?.githubId;
  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isGithubConnected = !!state.currentUser?.login;
  const isBountyInDraft = !!state.currentBounty?.data?.isDraft;
  const hasOpenPullRequest = !!state.currentBounty?.data?.pullRequests?.find((pullRequest) =>
      pullRequest?.githubLogin === state.currentUser?.login &&
      pullRequest?.status !== "canceled");
  const isBountyOwner =
    isWalletConnected &&
    state.currentBounty?.data?.creatorAddress &&
    state.currentBounty?.data?.creatorAddress ===
      state.currentUser?.walletAddress;

  const isFundingRequest = !!state.currentBounty?.data?.isFundingRequest;
  const isBountyFunded = state.currentBounty?.data?.fundedAmount?.isEqualTo(state.currentBounty?.data?.fundingAmount);
  const isBountyOpen =
    state.currentBounty?.data?.isClosed === false &&
    state.currentBounty?.data?.isCanceled === false;

  function handleClick(e) {
    // @ts-ignore
    if (node.current.contains(e.target)) return;

    setShow(false);
  }

  function loadOutsideClick() {
    if (show) document.addEventListener("mousedown", handleClick);
    else document.removeEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }

  async function handleHardCancel() {
    setShowHardCancelModal(false);
    handleHardCancelBounty().then(() => {
      updateWalletBalance();
      getDatabaseBounty(true);
    });
  }

  async function handleRedeem() {
    handleReedemIssue(getIssueState({
        state: state.currentBounty?.data?.state,
        amount: state.currentBounty?.data?.amount,
        fundingAmount: state.currentBounty?.data?.fundingAmount,
    }) === "funding").then(() => {
      updateWalletBalance(true);
      getDatabaseBounty(true);
    });
  }

  useEffect(() => {
    if (state.Service?.active && state.currentBounty?.data)
      (async () => {
        const cancelableTime = await state.Service?.active.getCancelableTime();
        const canceable =
          +new Date() >=
          +new Date(+state.currentBounty?.data.createdAt + cancelableTime);
        setIsCancelable(canceable);
      })();
  }, [state.Service?.active, state.currentBounty?.data]);

  function GithubLink({
    children,
    forcePath,
    hrefPath,
    onClick,
  }: {
    forcePath?: string;
    hrefPath: string;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  }) {
    return (
      <a
        href={`https://github.com/${forcePath}/${hrefPath}`}
        target="_blank"
        rel="noreferrer"
        className="text-decoration-none text-white hover-gray"
        onClick={onClick}
      >
        {children} <ArrowUpRight className="ms-1" />
      </a>
    );
  }

  function renderViewPullRequestLink() {
    if (
      isWalletConnected &&
      isGithubConnected &&
      !isBountyInDraft &&
      hasOpenPullRequest
    )
      return (
        <span className="d-flex py-2 cursor-pointer">
          <GithubLink
            forcePath={state.currentBounty?.data?.repository?.githubPath}
            hrefPath={`pull?q=base:${state.currentBounty?.data?.branch}`}
          >
            <Translation ns="pull-request" label="actions.view" />
          </GithubLink>
        </span>
      );
  }

  function renderEditButton() {
    if (isWalletConnected && isBountyInDraft && isBountyOwner)
      return (
        <span className="py-2 cursor-pointer" onClick={handleEditIssue}>
          <Translation ns="bounty" label="actions.edit-bounty" />
        </span>
      );
  }

  function renderCancel() {
    const Cancel = (isHard: boolean) => (
      <span
        className="py-2 cursor-pointer"
        onClick={() => (isHard ? setShowHardCancelModal(true) : handleRedeem())}
      >
        <Translation
          ns={isHard ? "common" : "bounty"}
          label={isHard ? "actions.cancel" : "actions.owner-cancel"}
        />
      </span>
    );

    if (state.Service?.network?.active?.isGovernor && isCancelable)
      return Cancel(true);

    const isDraftOrNotFunded = isFundingRequest
      ? !isBountyFunded
      : isBountyInDraft;

    if (
      isWalletConnected &&
      isBountyOpen &&
      isBountyOwner &&
      isDraftOrNotFunded &&
      !isEditIssue
    )
      return Cancel(false);
  }

  function renderActions() {
    return (
      <>
        <span className="d-flex pb-2 cursor-pointer">
          <GithubLink
            forcePath={state.currentBounty?.data?.repository?.githubPath}
            hrefPath={`${
              (state.currentBounty?.data?.state?.toLowerCase() ===
                "pull request" &&
                "pull") ||
              "issues"
            }/${issueGithubID || ""}`}
            onClick={
              !state.Service?.network?.repos?.active?.ghVisibility
                ? () => setShowGHModal(true)
                : null
            }
          >
            {t("actions.view-on-github")}
          </GithubLink>
        </span>
        {renderViewPullRequestLink()}
        {renderEditButton()}
        {renderCancel()}
      </>
    );
  }

  useEffect(loadOutsideClick, [show]);

  return (
    <>
      <div className="position-relative d-flex justify-content-end" ref={node}>
        <div
          className={`cursor-pointer border ${
            (show && "border-primary") || "border-gray-850"
          } border-radius-8 d-flex`}
          onClick={() => setShow(!show)}
        >
          <span className="mx-2 mb-2">. . .</span>
        </div>

        <div
          className={`border border-gray-800 rounded rounded-3 filter-wrapper d-${
            show ? "flex" : "none"
          } justify-content-start align-items-stretch position-absolute`}
        >
          <div className="d-flex flex-column bounty-settings px-2 pt-2 bg-gray-950">
            {renderActions()}
          </div>
        </div>
      </div>
      <Modal
        title={t("modals.gh-access.title")}
        centerTitle
        show={showGHModal}
        okLabel={t("actions.close")}
        onOkClick={() => setShowGHModal(false)}
      >
        <h5 className="text-center">
          <Translation ns="common" label="modals.gh-access.content" />
        </h5>
      </Modal>
      <Modal
        title={t("modals.hard-cancel.title")}
        centerTitle
        show={showHardCancelModal}
        onCloseClick={() => setShowHardCancelModal(false)}
        cancelLabel={t("actions.close")}
        okLabel={t("actions.continue")}
        onOkClick={handleHardCancel}
      >
        <h5 className="text-center">
          <Translation ns="common" label="modals.hard-cancel.content" />
        </h5>
      </Modal>
    </>
  );
}
