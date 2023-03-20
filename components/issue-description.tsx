import React, { useEffect, useState } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import DragAndDrop, { IFilesProps } from "components/drag-and-drop";
import MarkedRender from "components/MarkedRender";

import { useAppState } from "contexts/app-state";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";

interface DescriptionProps { 
  body: string; 
  setBody?: (v: string) => void;
  onUpdateFiles?: (files: IFilesProps[]) => void;
  onUploading?: (v: boolean) => void;
  files?: IFilesProps[];
  isEdit?: boolean;
  preview?: boolean;
}

export default function IssueDescription({ 
  body, 
  setBody,
  onUpdateFiles,
  onUploading,
  files, 
  isEdit = false,
  preview = false }: DescriptionProps) {
  const { t } = useTranslation(["common", "bounty"]);
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [strFiles, setStrFiles] = useState<string[]>();

  const {
    state: { Settings },
  } = useAppState();

  useEffect(() => {
    if (body?.length > 0 && strFiles) {
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
      setStrFiles(strFiles);
    }
  }, [files]);


  function handleChangeBody(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
  }

  return (
    <>
      <h3 className="caption-large mb-3">{t("misc.description")}</h3>
      <div className="bg-dark-gray p-3 rounded">
        <div className="p p-1">
          {isEdit && !preview ? (
            <>
            <textarea
                className={clsx("form-control", {
                  "border border-1 border-danger border-radius-8":
                    (bodyLength || body.length)> BODY_CHARACTERES_LIMIT || body.length === 0,
                })}
              placeholder={t("bounty:fields.description.placeholder")}
              value={body}
              rows={24}
              wrap="soft"
              onChange={handleChangeBody}
            />
            {((bodyLength || body.length) > BODY_CHARACTERES_LIMIT) && (
              <span className="caption-small text-danger bg-opacity-100">
                {t("bounty:errors.description-limit", { value: (bodyLength || body.length) })}
              </span>
            )}
            <DragAndDrop
              externalFiles={files}
              onUpdateFiles={onUpdateFiles}
              onUploading={onUploading}
            />
          </>
          ):
          (
            <MarkedRender source={body} />
          )}
        </div>
      </div>
    </>
  );
}