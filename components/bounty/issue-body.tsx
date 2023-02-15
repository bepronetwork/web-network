import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import CustomContainer from "components/custom-container";
import { IFilesProps } from "components/drag-and-drop";
import IssueDescription from "components/issue-description";
import IssueProposalProgressBar from "components/issue-proposal-progress-bar";

import { useAppState } from "contexts/app-state";

import useApi from "x-hooks/use-api";
import { useBounty } from "x-hooks/use-bounty";

import IssueEditTag from "./issue-edit-tag";

interface issueBodyProps {
  isEditIssue: boolean;
  description: string;
  cancelEditIssue: () => void;
}

export default function IssueBody({
  isEditIssue,
  description,
  cancelEditIssue,
}: issueBodyProps) {
  const { t } = useTranslation(["common", "bounty"]);
  const [body, setBody] = useState<string>();
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { getDatabaseBounty } = useBounty();
  const { state } = useAppState();

  const { updateIssue } = useApi();

  useEffect(() => {
    setBody(description);
  }, [description]);

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

  function handleUpdateIssue() {
    if (
      (addFilesInDescription(body) === description &&
        selectedTags === state.currentBounty?.data?.tags) ||
      !state.currentBounty.data
    )
      return;
    setIsUploading(true);
    updateIssue({
      repoId: state.currentBounty?.data?.repository_id,
      ghId: state.currentBounty?.data?.githubId,
      networkName: state.Service?.network?.active?.name,
      body: addFilesInDescription(body),
      tags: selectedTags,
    })
      .then(() => {
        getDatabaseBounty(true);
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

  if (state.currentUser?.walletAddress)
    return (
      <div className="container mb-1">
        <div className="d-flex bd-highlight justify-content-center mx-2 px-4">
          <div className="ps-3 pe-0 ms-0 me-2 w-65 bd-highlight">
            <div className="content-wrapper mb-3">
              {isEditIssue && (
                <div className="d-flex justify-content-center">
                  <span className="p family-Regular font-weight-medium mt-1 text-info">
                    {t("bounty:edit-text")}
                  </span>
                </div>
              )}
              <IssueEditTag
                isEdit={isEditIssue}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                preview={isPreview}
              />
              <div className="container">
                <IssueDescription
                  body={isPreview ? addFilesInDescription(body) : body}
                  setBody={setBody}
                  isEdit={isEditIssue}
                  onUpdateFiles={onUpdateFiles}
                  onUploading={setIsUploading}
                  files={files}
                  preview={isPreview}
                />
              </div>
              {isEditIssue && (
                <>
                  <div className="d-flex flex-row justify-content-between my-3">
                    <Button
                      color="danger"
                      onClick={handleCancelEdit}
                      disabled={false}
                    >
                      {t("bounty:cancel-changes")}
                    </Button>
                    <div className="d-flex">
                      <Button
                        outline={true}
                        className="d-flex flex-shrink-0 w-40 btn-block"
                        onClick={() => setIsPreview(!isPreview)}
                        disabled={isUploading}
                      >
                        {t("bounty:preview")}
                      </Button>
                      <Button
                        className="d-flex flex-shrink-0 w-40 btn-block"
                        onClick={handleUpdateIssue}
                        disabled={isUploading}
                        isLoading={isUploading}
                      >
                        {t("bounty:save-changes")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="p-0 me-3 flex-shrink-0 w-25 bd-highlight">
            <div className="sticky-bounty">
              <IssueProposalProgressBar />
            </div>
          </div>
        </div>
      </div>
    );
  else
    return (
      <CustomContainer>
        <div className="content-wrapper mb-3">
          <IssueDescription body={body || ""} />
        </div>
      </CustomContainer>
    );
}
