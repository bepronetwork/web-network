import React, { useEffect, useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import DescriptionPreviewModal from "components/description-preview-modal";
import DragAndDrop from "components/drag-and-drop";

import { useAppState } from "contexts/app-state";

import { BODY_CHARACTERES_LIMIT } from "helpers/contants";

import Button from "./button";

export default function CreateBountyDetails({
  bountyTitle,
  setBountyTitle,
  bountyDescription,
  setBountyDescription,
  onUpdateFiles,
  onUploading,
  files,
  review = false,
}) {
  const { t } = useTranslation("bounty");

  const [strFiles, setStrFiles] = useState<string>("");
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    state: { Settings },
  } = useAppState();

  const titleLimit = 131;

  function handleShowModal() {
    setShowPreviewModal(true);
  }

  function handleCloseModal() {
    setShowPreviewModal(false);
  }
  
  function handleChangeTitle (e: React.ChangeEvent<HTMLInputElement>) {
    setBountyTitle(e.target.value)
  }

  function handleChangeDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBountyDescription(e.target.value);
  }

  useEffect(() => {
    if (bountyDescription.length > 0) {
      const body = `${bountyDescription}\n\n${strFiles
        .toString()
        .replace(",![", "![")
        .replace(",[", "[")}`;

      if(body?.length) setBodyLength(body.length);
    }
  }, [bountyDescription, strFiles]);

  useEffect(() => {
    if (files.length > 0) {
      const strFiles = files?.map((file) =>
          file.uploaded &&
          `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
            Settings?.urls?.ipfs
          }/${file.hash}) \n\n`);

      setStrFiles(strFiles);
    }
  }, [files]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12 m-0">
          <div className="form-group">
            <label className="caption-small mb-2">
              {t("fields.title.label")}
            </label>
            <input
              type="text"
              className={clsx("form-control rounded-lg", {
                "border border-1 border-danger border-radius-8": bountyTitle.length >= titleLimit
              })}
              placeholder={t("fields.title.placeholder")}
              value={bountyTitle}
              onChange={handleChangeTitle}
              disabled={review}
            />
            {bountyTitle.length >= titleLimit && (
              <span className="caption-small mt-3 text-danger bg-opacity-100">
                {t("errors.title-character-limit", {value: bountyTitle?.length})}
              </span>
            )}
            {!review && (
              <p className="p-small text-gray trans mt-2">
                {t("fields.title.tip")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="caption-small mb-2">
          {t("fields.description.label")}
        </label>
        <textarea
          className={clsx("form-control", {
            "border border-1 border-danger border-radius-8": (bodyLength > BODY_CHARACTERES_LIMIT),
          })}
          rows={3}
          placeholder={t("fields.description.placeholder")}
          value={bountyDescription}
          onChange={handleChangeDescription}
          disabled={review}
        />
        {(bodyLength > BODY_CHARACTERES_LIMIT) && (
          <span className="caption-small text-danger bg-opacity-100">
            {t("errors.description-limit", { value: bodyLength })}
          </span>
        )}

        { review && 
          <Button 
          onClick={handleShowModal}
          outline
          className="mt-2"
        >
          Preview Description
        </Button>
        }
      </div>
      <div className="mb-4">
        <DragAndDrop
          externalFiles={files}
          onUpdateFiles={onUpdateFiles}
          onUploading={onUploading}
          review={review}
        />
      </div>

      <DescriptionPreviewModal
        description={bountyDescription}
        show={showPreviewModal && review}
        onClose={handleCloseModal}
      />
    </div>
  );
}
