import { useState } from "react";

import { useTranslation } from "next-i18next";

import { IFilesProps } from "components/drag-and-drop";

import { useAppState } from "contexts/app-state";
import { addToast, toastError } from "contexts/reducers/change-toaster";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";
import { addFilesToMarkdown } from "helpers/markdown";
import { TAGS_OPTIONS } from "helpers/tags-options";

import { IssueBigNumberData } from "interfaces/issue-data";

import useEditBounty from "x-hooks/api/bounty/use-edit-bounty";

import BountyBodyView from "./view";

interface BountyBodyControllerProps {
  isEditIssue: boolean;
  cancelEditIssue: () => void;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

export default function BountyBody({
  isEditIssue,
  cancelEditIssue,
  currentBounty,
  updateBountyData
}: BountyBodyControllerProps) {
  const { t } = useTranslation(["common", "bounty"]);

  const [body, setBody] = useState<string>(currentBounty?.body);
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(TAGS_OPTIONS.filter((tag) =>
    currentBounty?.tags?.includes(tag.value)).map((e) => e.value));
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { state, dispatch } = useAppState();

  function onUpdateFiles(files: IFilesProps[]) {
    return setFiles(files);
  }

  function addFilesInDescription(str) {
    return addFilesToMarkdown(str, files, state.Settings?.urls?.ipfs);
  }

  function handleUpdateBounty() {
    if (
      (addFilesInDescription(body) === currentBounty?.body &&
        selectedTags === currentBounty?.tags) ||
      !currentBounty
    )
      return;
    setIsUploading(true);
    useEditBounty({
      id: currentBounty?.id,
      networkName: state.Service?.network?.active?.name,
      chainName: state.Service?.network?.active?.chain?.chainShortName,
      body: addFilesInDescription(body),
      tags: selectedTags,
    })
      .then(() => {
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("bounty:actions.edit-bounty"),
        }));
        updateBountyData();
        cancelEditIssue();
        setIsPreview(false);
      })
      .catch(error => {
        dispatch(toastError(t("errors.something-went-wrong"), t("actions.failed")));
        console.debug("Failed to edit issue", error);
      })
      .finally(() => setIsUploading(false));
  }

  function handleCancelEdit() {
    setIsPreview(false);
    cancelEditIssue();
  }

  function isDisableUpdateIssue() {
    return (
      isUploading ||
      addFilesInDescription(body)?.length > BODY_CHARACTERES_LIMIT ||
      body?.length === 0
    );
  }

  return (
    <BountyBodyView
      walletAddress={state.currentUser?.walletAddress}
      isDisableUpdateIssue={isDisableUpdateIssue}
      handleCancelEdit={handleCancelEdit}
      handleUpdateBounty={handleUpdateBounty}
      handleBody={setBody}
      body={body}
      isEditIssue={isEditIssue}
      isPreview={isPreview}
      handleIsPreview={setIsPreview}
      files={files}
      handleFiles={onUpdateFiles}
      selectedTags={selectedTags}
      handleSelectedTags={setSelectedTags}
      isUploading={isUploading}
      handleIsUploading={setIsUploading}
      addFilesInDescription={addFilesInDescription}
      bounty={currentBounty}
    />
  );
}
