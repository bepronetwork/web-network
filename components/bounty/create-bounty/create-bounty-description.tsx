import React, { useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import DragAndDrop, { IFilesProps } from "components/drag-and-drop";
import MarkedRender from "components/MarkedRender";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";

import BountyLabel from "./create-bounty-label";

interface DescriptionProps {
  description: string;
  handleChangeDescription: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  bodyLength: number;
  files: IFilesProps[];
  updateFiles: (files: IFilesProps[]) => void;
  updateUploading: (e: boolean) => void;
}

export default function CreateBountyDescription({
  handleChangeDescription,
  description,
  bodyLength,
  files,
  updateFiles,
  updateUploading,
}: DescriptionProps) {
  const { t } = useTranslation("bounty");
  const [isPreview, setIsPreview] = useState<boolean>(false);

  return (
    <>
      <BountyLabel className="mb-2" required>
        {t("fields.description.label")}
      </BountyLabel>
      <div className="p-1 border border-radius-4 border-gray-700">
        <div className="d-flex mt-1 mb-2">
          <Button
            tabIndex={1}
            outline
            onClick={() => setIsPreview(false)}
            className={
              isPreview ? "description-button text-gray" : "active-description-button"
            }
          >
            {t("write")}
          </Button>
          <Button
            tabIndex={2}
            outline
            onClick={() => setIsPreview(true)}
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
              className={clsx("form-control form-bounty", {
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

            <div className="mt-2">
              <DragAndDrop
                externalFiles={files}
                onUpdateFiles={updateFiles}
                onUploading={updateUploading}
                review={false}
                border={true}
              />
            </div>
          </>
        ) : (
          <div className="border border-radius-8 border-gray-700 bg-gray-800 py-2 px-3">
            <MarkedRender source={description} />
          </div>
        )}
      </div>
    </>
  );
}
