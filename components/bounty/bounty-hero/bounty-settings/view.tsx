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

import { ServiceNetwork } from "interfaces/application-state";
import { IssueBigNumberData } from "interfaces/issue-data";

interface BountySettingsViewProps {
    handleEditIssue?: () => void;
    isEditIssue?: boolean;
    handleHardCancel?: () => void;
    handleRedeem?: () => void;
    bounty: IssueBigNumberData;
    network: ServiceNetwork;
    isWalletConnected: boolean;
    isGithubConnected: boolean;
    isBountyInDraft: boolean;
    hasOpenPullRequest: boolean;
    isBountyOwner: boolean;
    isCancelable: boolean;
    isFundingRequest: boolean;
    isBountyFunded: boolean;
    isBountyOpen: boolean;
}
  
export default function BountySettingsView({
    handleEditIssue,
    handleHardCancel,
    handleRedeem,
    isEditIssue,
    bounty,
    network,
    isWalletConnected,
    isGithubConnected,
    isBountyInDraft,
    hasOpenPullRequest,
    isBountyOwner,
    isCancelable,
    isFundingRequest,
    isBountyFunded,
    isBountyOpen
  }: BountySettingsViewProps) {
  const { t } = useTranslation(["common", "pull-request", "bounty"]);
  const node = useRef();

  const [show, setShow] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [showHardCancelModal, setShowHardCancelModal] = useState(false);

  function handleHardCancelBounty() {
    setShowHardCancelModal(false)
    handleHardCancel()
  }

  function handleHide() {
    setShow(false);
  }
  
  function handleClick(e) {
      // @ts-ignore
    if (node.current.contains(e.target)) return;
  
    handleHide();
  }
  
  function loadOutsideClick() {
    if (show) document.addEventListener("mousedown", handleClick);
    else document.removeEventListener("mousedown", handleClick);
  
    return () => document.removeEventListener("mousedown", handleClick);
  }
  
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
          <span className="d-flex cursor-pointer">
            <GithubLink
              forcePath={bounty?.repository?.githubPath}
              hrefPath={`pull?q=base:${bounty?.branch}`}
              onClick={handleHide}
            >
              <Translation ns="pull-request" label="actions.view" />
            </GithubLink>
          </span>
      );
  }

  function handleEditClick() {
    handleHide();
    handleEditIssue();
  }
  
  function renderEditButton() {
    if (isWalletConnected && isBountyInDraft && isBountyOwner)
      return (
          <span className="cursor-pointer" onClick={handleEditClick}>
            <Translation ns="bounty" label="actions.edit-bounty" />
          </span>
      );
  }

  function handleCancelClick(isHard) {
    return () => {
      if (isHard)
        setShowHardCancelModal(true)
      else
        handleRedeem();
      handleHide();
    }
  }
  
  function renderCancel() {
    const Cancel = (isHard: boolean) => (
        <span
          className="cursor-pointer"
          onClick={handleCancelClick(isHard)}
        >
          <Translation
            ns={isHard ? "common" : "bounty"}
            label={isHard ? "actions.cancel" : "actions.owner-cancel"}
          />
        </span>
      );
  
    if (network?.active?.isGovernor && isCancelable)
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

  function handleGithubLinkClick() {
    if (!network?.repos?.active?.ghVisibility) setShowGHModal(true);

    handleHide();
  }
  
  function renderActions() {
    return (
        <>
          <span className="d-flex cursor-pointer">
            <GithubLink
              forcePath={bounty?.repository?.githubPath}
              hrefPath={`${
                (bounty?.state?.toLowerCase() ===
                  "pull request" &&
                  "pull") ||
                "issues"
              }/${bounty?.githubId || ""}`}
              onClick={handleGithubLinkClick}
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
            className={`border border-gray-800 border-radius-4 filter-wrapper d-${
              show ? "flex" : "none"
            } justify-content-start align-items-stretch position-absolute`}
          >
            <div className="d-flex gap-2 flex-column bounty-settings p-2 bg-gray-950">
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
          onOkClick={handleHardCancelBounty}
        >
          <h5 className="text-center">
            <Translation ns="common" label="modals.hard-cancel.content" />
          </h5>
        </Modal>
      </>
  );
}
  