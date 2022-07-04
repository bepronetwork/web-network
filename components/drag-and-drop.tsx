import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

import { useTranslation } from "next-i18next";

import ClipIcon from "assets/icons/clip-icon";
import CloseIcon from "assets/icons/close-icon";

import { truncateAddress } from "helpers/truncate-address";

import useApi from "x-hooks/use-api";

export interface IFilesProps {
  name: string;
  hash?: string;
  uploaded: boolean;
  type?: string;
}

interface IDragAndDropProps {
  onUpdateFiles: (files: IFilesProps[]) => void;
  review?: boolean
  disabled?: boolean;
}

export default function DragAndDrop({ onUpdateFiles, review = false, disabled }: IDragAndDropProps) 
  const [files, setFiles] = useState<IFilesProps[]>([] as IFilesProps[]);
  const { t } = useTranslation(["common"]);
  const { uploadFiles } = useApi();

  const onDropAccepted = useCallback(async (dropedFiles) => {
    const createFiles = dropedFiles.map((file) => ({
        name: file?.name,
        hash: null,
        uploaded: false,
        type: file?.type
    }));
    const arrFiles = [...files, ...createFiles];
    setFiles([...files, ...createFiles]);

    uploadFiles(dropedFiles)
        .then(async (updateData) => {
          const updatefiles = await Promise.all(arrFiles.map(async (currentFile) => {
            const find = updateData?.find((el) => el.fileName === currentFile.name);
            return {
                ...currentFile,
                uploaded: true,
                hash: find?.hash
            } as IFilesProps;
          }));
          setFiles(updatefiles);
        })
        .catch(() => {
          setFiles(files.filter((file) => file.uploaded));
        });
  },
    [files]);

  useEffect(() => {
    onUpdateFiles?.(files);
  }, [files]);
  const useDrop = {
    accept: "image/jpeg, image/png, application/pdf",
    maxSize: 32000000, //32mb (max size ipfs)
    onDropAccepted,
    disabled
  };
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone(useDrop);

  function handlerRemove(file) {
    const newList = files.filter((i) => i.name !== file.name);
    setFiles(newList);
  }

  const filesNames = files?.map((file, i) => (
    <span key={i} className="selected-file-item my-1 mx-2 text-lowercase">
      {truncateAddress(file?.name, 17, 3)}{" "}
      {file.uploaded ? 
        !review && (
          <CloseIcon
          width={8}
          height={8}
          className="ms-2 cursor-pointer"
          onClick={() => {
            handlerRemove(file);
          }}
        />)
       : (
        <span className="spinner-border spinner-border-sm" />
      )}
    </span>
  ));

  return (
    <>
      <div className="d-flex flex-wrap align-items-center text-center">
        {!review && (
          <button
          {...getRootProps({
            className:
              "dropzone border border-dark-gray bg-transparent rounded-pill p-2 mr-2"
          })}
        >
          <input {...getInputProps()} />
          <div className="d-flex justify-content-center align-items-center text-center">
            {!isDragActive && (
              <>
                <ClipIcon className="me-1" />{" "}
                <span className="text-white text-uppercase">
                  {t("drag-and-drop.attach-file")}
                </span>
              </>
            )}
          </div>
        </button>
        )}

        {filesNames}
      </div>
      {isDragReject && (
        <span className="p-small text-danger my-2 tran">
          {t("drag-and-drop.drag-reject")}
        </span>
      )}
    </>
  );
}
