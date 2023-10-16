import React from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import DragAndDrop, { IFilesProps } from "components/drag-and-drop";
import MarkedRender from "components/MarkedRender";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";

import BountyLabel from "../../bounty/create-bounty/create-bounty-label";

interface DescriptionAndPreviewViewProps {
  description: string;
  handleChangeDescription: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  bodyLength?: number;
  files?: IFilesProps[];
  updateFiles?: (files: IFilesProps[]) => void;
  updateUploading?: (e: boolean) => void;
  textAreaColor?: string;
  borderColor?: string;
  isPreview: boolean;
  updateIsPreview: (e: boolean) => void;
}

export default function DescriptionAndPreviewView({
  handleChangeDescription,
  description,
  bodyLength,
  files,
  updateFiles,
  updateUploading,
  textAreaColor,
  borderColor,
  isPreview,
  updateIsPreview
}: DescriptionAndPreviewViewProps) {
  const { t } = useTranslation("bounty");

  return (
    <>
      <BountyLabel className="mb-2" required>
        {t("fields.description.label")}
      </BountyLabel>
      <div className={`p-1 border border-radius-4 border-${borderColor ? borderColor : 'gray-700'}`}>
        <div className="d-flex mt-1 mb-2">
          <Button
            tabIndex={1}
            outline
            onClick={() => updateIsPreview(false)}
            className={
              isPreview ? "description-button text-gray" : "active-description-button"
            }
          >
            {t("write")}
          </Button>
          <Button
            tabIndex={2}
            outline
            onClick={() => updateIsPreview(true)}
            className={
              !isPreview ? "description-button text-gray" : "active-description-button"
            }
          >
            {t("preview")}
          </Button>
        </div>
        {!isPreview ? (
          <>
            <textarea
              tabIndex={0}
              className={clsx(`form-control form-bounty ${
                textAreaColor ? `bg-${textAreaColor}` : ""
              }`,
                              {
                "border border-1 border-danger border-radius-8":
                  bodyLength > BODY_CHARACTERES_LIMIT,
                              })}
              rows={8}
              placeholder={t("fields.description.placeholder")}
              value={description}
              onChange={handleChangeDescription}
            />
            {bodyLength > BODY_CHARACTERES_LIMIT && (
              <span className="caption-small text-danger bg-opacity-100">
                {t("errors.description-limit", { value: bodyLength })}
              </span>
            )}
            {files && (
              <div className="mt-2">
                <DragAndDrop
                  externalFiles={files}
                  onUpdateFiles={updateFiles}
                  onUploading={updateUploading}
                  review={false}
                  border={true}
                />
              </div>
            )}
          </>
        ) : (
          <div
            className={`border border-radius-8 border-${
              borderColor ? borderColor : "gray-700"
            } bg-${textAreaColor ? textAreaColor : "gray-800"} py-2 px-3`}
          >
            <MarkedRender source={description} />
          </div>
        )}
      </div>
    </>
  );
}
