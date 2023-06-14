import React, { useEffect, useState } from "react";

import { IFilesProps } from "components/drag-and-drop";

import { useAppState } from "contexts/app-state";

import BountyDescriptionView from "./view";

interface DescriptionProps {
  body: string;
  setBody?: (v: string) => void;
  onUpdateFiles?: (files: IFilesProps[]) => void;
  onUploading?: (v: boolean) => void;
  files?: IFilesProps[];
  isEdit?: boolean;
  preview?: boolean;
}

export default function BountyDescription({
  body,
  setBody,
  onUpdateFiles,
  onUploading,
  files,
  isEdit = false,
  preview = false,
}: DescriptionProps) {
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

      if (description?.length) {
        setBodyLength(description.length);
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
    setBody(e.target.value);
  }

  return (
    <BountyDescriptionView
      body={body}
      handleChangeBody={handleChangeBody}
      onUpdateFiles={onUpdateFiles}
      onUploading={onUploading}
      files={files}
      isEdit={isEdit}
      preview={preview}
      bodyLength={bodyLength}
    />
  );
}
