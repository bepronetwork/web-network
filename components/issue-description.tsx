import React, { useEffect, useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import MarkedRender from "components/MarkedRender";

import { useAppState } from "contexts/app-state";

import { BODY_CHARACTERES_LIMIT } from "helpers/contants";

import DragAndDrop, { IFilesProps } from "./drag-and-drop";

interface DescriptionProps { description: string; isEdit?: boolean}

export default function IssueDescription({ description, isEdit = false }: DescriptionProps) {
  const { t } = useTranslation(["common", "bounty"]);
  const [body, setBody] = useState<string>();
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [strFiles, setStrFiles] = useState<string[]>();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const {
    state: { Settings },
  } = useAppState();

  useEffect(() => {
    if (body?.length > 0 && strFiles) {
      console.log('str', strFiles)
      const description = `${body}\n\n${strFiles
        .toString()
        .replace(",![", "![")
        .replace(",[", "[")}`;

      if(description?.length) {
        setBodyLength(description.length)
      }
    }
  }, [body, strFiles]);

  useEffect(() => {
    if (files?.length > 0) {
      const strFiles = files?.map((file) =>
          file.uploaded &&
          `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
            Settings?.urls?.ipfs
          }/${file.hash}) \n\n`);
      console.log('strFiles', strFiles)
      setStrFiles(strFiles);
    }
  }, [files]);


  useEffect(() => {
    setBody(description)
  },[description])


  function handleChangeBody(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
  }

  return (
    <>
      <h3 className="caption-large mb-3">{t("misc.description")}</h3>
      <div className="bg-dark-gray p-3 rounded">
        <div className="p p-1">
          {isEdit ? (
            <>
            <textarea
              className={clsx("form-control", {
                "border border-1 border-danger border-radius-8": (bodyLength > BODY_CHARACTERES_LIMIT),
              })}
              placeholder={t("bounty:fields.description.placeholder")}
              value={body}
              rows={24}
              wrap="soft"
              onChange={handleChangeBody}
            />
            {(bodyLength > BODY_CHARACTERES_LIMIT) && (
              <span className="caption-small text-danger bg-opacity-100">
                {t("bounty:errors.description-limit", { value: bodyLength })}
              </span>
            )}
            <DragAndDrop
              externalFiles={files}
              onUpdateFiles={setFiles}
              onUploading={setIsUploading}
            />
          </>
          ):
          (
            <MarkedRender source={description} />
          )}
        </div>
      </div>
    </>
  );
}