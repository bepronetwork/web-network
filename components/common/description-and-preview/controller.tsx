import React, { useState } from "react";

import { IFilesProps } from "components/drag-and-drop";

import DescriptionAndPreviewView from "./view";

interface DescriptionProps {
  description: string;
  handleChangeDescription: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  bodyLength?: number;
  files?: IFilesProps[];
  updateFiles?: (files: IFilesProps[]) => void;
  updateUploading?: (e: boolean) => void;
  textAreaColor?: string;
  borderColor?: string;
}

export default function DescriptionAndPreview({
  handleChangeDescription,
  description,
  bodyLength,
  files,
  updateFiles,
  updateUploading,
  textAreaColor,
  borderColor,
}: DescriptionProps) {
  const [isPreview, setIsPreview] = useState<boolean>(false);

  return (
    <DescriptionAndPreviewView
      description={description}
      handleChangeDescription={handleChangeDescription}
      isPreview={isPreview}
      updateIsPreview={setIsPreview}
      bodyLength={bodyLength}
      files={files}
      updateFiles={updateFiles}
      updateUploading={updateUploading}
      textAreaColor={textAreaColor}
      borderColor={borderColor}
    />
  );
}
