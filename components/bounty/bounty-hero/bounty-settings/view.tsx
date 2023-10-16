import {
    useEffect,
    useRef,
    useState,
  } from "react";
  
import { useTranslation } from "next-i18next";
  
import Modal from "components/modal";
import Translation from "components/translation";

import { ServiceNetwork } from "interfaces/application-state";

interface BountySettingsViewProps {
    handleEditIssue?: () => void;
    isEditIssue?: boolean;
    handleHardCancel?: () => void;
    handleRedeem?: () => void;
    network: ServiceNetwork;
    isWalletConnected: boolean;
    isBountyInDraft: boolean;
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
    network,
    isWalletConnected,
    isBountyInDraft,
    isBountyOwner,
    isCancelable,
    isFundingRequest,
    isBountyFunded,
    isBountyOpen
  }: BountySettingsViewProps) {
  const { t } = useTranslation(["common", "deliverable", "bounty"]);
  const node = useRef();

  const [show, setShow] = useState(false);
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
  
  function renderActions() {
    return (
        <>
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
  