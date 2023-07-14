import { useTranslation } from "next-i18next";

import BountyDescription from "components/bounty/description/controller";
import BountyEditTag from "components/bounty/edit-tag/controller";
import BountyStatusProgress from "components/bounty/status-progress/controller";
import Button from "components/button";
import { IFilesProps } from "components/drag-and-drop";

import { IssueBigNumberData } from "interfaces/issue-data";

interface BountyBodyProps {
  isEditIssue: boolean;
  body: string;
  handleBody: (v: string) => void;
  files: IFilesProps[];
  handleFiles: (v: IFilesProps[]) => void;
  isPreview: boolean;
  handleIsPreview: (v: boolean) => void;
  selectedTags: string[];
  handleSelectedTags: (v: string[]) => void;
  isUploading: boolean;
  handleIsUploading: (v: boolean) => void;
  handleCancelEdit: () => void;
  addFilesInDescription: (str: string) => string;
  handleUpdateBounty: () => void;
  isDisableUpdateIssue: () => boolean;
  walletAddress?: string;
  bounty: IssueBigNumberData;
}

export default function BountyBodyView({
  isEditIssue,
  body,
  handleBody,
  files,
  handleFiles,
  isPreview,
  handleIsPreview,
  selectedTags,
  handleSelectedTags,
  isUploading,
  handleIsUploading,
  handleCancelEdit,
  addFilesInDescription,
  handleUpdateBounty,
  isDisableUpdateIssue,
  walletAddress,
  bounty
}: BountyBodyProps) {
  const { t } = useTranslation(["common", "bounty"]);

  if (walletAddress)
    return (
      <div className="mb-1">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="border-radius-8 p-3 bg-gray-850 mb-3">
              {isEditIssue && (
                <div className="d-flex justify-content-center">
                  <span className="p family-Regular font-weight-medium mt-1 text-info">
                    {t("bounty:edit-text")}
                  </span>
                </div>
              )}
              <BountyEditTag
                isEdit={isEditIssue}
                selectedTags={selectedTags}
                setSelectedTags={handleSelectedTags}
                preview={isPreview}
              />
              <>
                <BountyDescription
                  body={isPreview ? addFilesInDescription(body) : body}
                  setBody={handleBody}
                  isEdit={isEditIssue}
                  onUpdateFiles={handleFiles}
                  onUploading={handleIsUploading}
                  files={files}
                  preview={isPreview}
                />
              </>
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
                        onClick={() => handleIsPreview(!isPreview)}
                        disabled={isUploading}
                      >
                        {!isPreview ? t("bounty:preview") : t("bounty:edit")}
                      </Button>
                      <Button
                        className="d-flex flex-shrink-0 w-40 btn-block"
                        onClick={handleUpdateBounty}
                        disabled={isDisableUpdateIssue()}
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
          <div className="col-12 col-md-4">
              <BountyStatusProgress currentBounty={bounty}/>
          </div>
        </div>
      </div>
    );
  else
    return (
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="border-radius-8 p-3 bg-gray-850 mb-3">
            <BountyDescription body={body || ""} />
          </div>
        </div>
      </div>
    );
}
