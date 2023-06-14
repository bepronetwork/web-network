import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { IFilesProps } from "components/drag-and-drop";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";
import { TAGS_OPTIONS } from "helpers/tags-options";

import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";

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
  const [body, setBody] = useState<string>();
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { state, dispatch } = useAppState();

  const { updateIssue } = useApi();

  useEffect(() => {
    if (!currentBounty?.body) return;

    setBody(currentBounty?.body);
  }, [currentBounty]);

  useEffect(() => {
    setSelectedTags(TAGS_OPTIONS.filter((tag) =>
        currentBounty?.tags?.includes(tag.value)).map((e) => e.value));
  }, [currentBounty?.tags]);

  function onUpdateFiles(files: IFilesProps[]) {
    return setFiles(files);
  }

  function addFilesInDescription(str) {
    const strFiles = files?.map((file) =>
        file.uploaded &&
        `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
          state.Settings?.urls?.ipfs
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  function handleUpdateBounty() {
    if (
      (addFilesInDescription(body) === currentBounty?.body &&
        selectedTags === currentBounty?.tags) ||
      !currentBounty
    )
      return;
    setIsUploading(true);
    updateIssue({
      repoId: currentBounty?.repository_id,
      ghId: currentBounty?.githubId,
      networkName: state.Service?.network?.active?.name,
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
      .catch((err) => console.log("update issue error", err))
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
