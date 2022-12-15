import React, { useEffect, useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";

import { BODY_CHARACTERES_LIMIT } from "helpers/contants";

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
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [strFiles, setStrFiles] = useState<string>("");
  const {
    state: { Settings },
  } = useAppState();

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
              className="form-control rounded-lg"
              placeholder={t("fields.title.placeholder")}
              value={bountyTitle}
              onChange={(e) => setBountyTitle(e.target.value)}
              disabled={review}
            />
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
