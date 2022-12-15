import React, { useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import DragAndDrop from "./drag-and-drop";

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
  const titleLimit = 131

  function handleChangeTitle (e: React.ChangeEvent<HTMLInputElement>) {
    setBountyTitle(e.target.value)
  }

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
          className="form-control"
          rows={3}
          placeholder={t("fields.description.placeholder")}
          value={bountyDescription}
          onChange={(e) => setBountyDescription(e.target.value)}
          disabled={review}
        />
      </div>
      <div className="mb-4">
        <DragAndDrop
          externalFiles={files}
          onUpdateFiles={onUpdateFiles}
          onUploading={onUploading}
          review={review}
        />
      </div>
    </div>
  );
}
