import { useState, useCallback, useEffect } from "react";
import { useDropzone, FileError } from "react-dropzone";

import { useTranslation } from "next-i18next";

import ClipIcon from "assets/icons/clip-icon";
import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";

import { trimString } from "helpers/string";

import useApi from "x-hooks/use-api";

export interface IFilesProps extends File{
  name: string;
  path: string;
  hash?: string;
  uploaded: boolean;
}

interface IDragAndDropProps {
  onUpdateFiles?: (files: IFilesProps[]) => void;
  onUploading?: (isUploading: boolean) => void
  review?: boolean
  disabled?: boolean;
  externalFiles?: IFilesProps[];
  border?: boolean;
}

export default function DragAndDrop({
  externalFiles,
  onUpdateFiles,
  onUploading,
  review = false,
  disabled,
  border = false,
}: IDragAndDropProps) {
  const [files, setFiles] = useState<IFilesProps[]>(externalFiles ? externalFiles : [] as IFilesProps[]);
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{file: File, error: FileError}[]>([])
  const { t } = useTranslation(["common"]);
  const { uploadFiles } = useApi();

  const onDropAccepted = useCallback(async (dropedFiles) => {
    setIsUploading(true)
    uploadFiles(dropedFiles)
        .then(async (updateData) => {
          setFiles((oldFiles)=> {
            return oldFiles.map((file)=>{
              const find = updateData?.find((el) => el.fileName === file.name)
              if(find)
                return{
                  ...file,
                  uploaded: true,
                  hash: find?.hash
                }
                
              return file;
            });
          });
        })
        .catch(() => {
          setFiles((oldFiles) => oldFiles.filter((file) => file.uploaded));
        })
        .finally(()=> setIsUploading(false))
  },
    []);

  const onDropRejected = useCallback((files)=>
    files.map(({file, errors})=> setErrors((oldErros)=>([...oldErros, {file, error: errors[0]}])))
  ,[])

  const onDrop = useCallback((acceptedFiles) => {
    setErrors([])
    acceptedFiles.forEach((file) => {
      setFiles((oldFiles)=>([...oldFiles, {
        name: file?.name,
        hash: null,
        uploaded: false,
        type: file?.type,
        ...file,
      }]));
    })
    
  }, [])

  function validator(file) {
    if (files.findIndex(f=> f.name === file.name || f.path === file.path) !== -1) {
      return {
        code: "file-alrady-uploaded",
        message: "file-alrady-uploaded"
      };
    }
  
    return null
  }

  function handlerRemoveFile(file){
    setErrors([])
    setFiles((oldFiles)=> oldFiles.filter((i) => i.name !== file.name))
  }

  function getMessageError(code){
    if(code === 'file-alrady-uploaded')
      return t('drag-and-drop.already-uploaded')
    
    else if(code === 'file-too-large')
      return t('drag-and-drop.file-too-large', {
        value: 10,
      })
    
    else {
      return t("drag-and-drop.drag-reject")
    }
  }

  const useDrop = {
    accept: "image/jpeg, image/png, application/pdf",
    validator,
    maxSize: 12288800, //32mb (max size ipfs)
    onDropAccepted,
    onDrop,
    onDropRejected,
    disabled
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone(useDrop);

  useEffect(() => {
    onUpdateFiles?.(files);
  }, [files]);

  useEffect(()=> {
    onUploading?.(isUploading)
  },[isUploading])

  const filesNames = files?.map((file, i) => (
    <span key={i} className="selected-file-item my-1 mx-2 text-lowercase">
      {trimString(file?.name, 15)}{" "}
      {file.uploaded ? 
        !review && (
          <CloseIcon
          width={8}
          height={8}
          className="ms-2 cursor-pointer"
          onClick={()=> handlerRemoveFile(file)}
        />)
       : (
        <span className="spinner-border spinner-border-sm" />
      )}
    </span>
  ));

  return (
    <>
      <div
        className={`d-flex ${
          border && "border-dotter border-radius-4 border-gray-700"
        } flex-wrap align-items-center text-center`}
      >
        {!review && (
          <button
          {...getRootProps({
            className: `${
              border
                ? "col-12 d-flex justify-content-start border-none"
                : "border border-dark-gray"
            } dropzone bg-transparent rounded-pill p-2 mr-2`,
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

        { (!review && !border)&&
          <span className="d-inline-flex align-items-center p-small text-warning text-center my-2 tran">
            <InfoIconEmpty
              width={12}
              height={12} 
              color="text-warning" 
              className="mr-1"
            /> 
            {t("drag-and-drop.size-limit", {value: 10})}
          </span>
        }
      </div>
      <div className="d-flex flex-wrap gap-1">
          {filesNames}
      </div>
      {isDragReject && (
        <span className="p-small text-danger my-2 tran">
          {t("drag-and-drop.drag-reject")}
        </span>
      )}

      {errors && (
        <div className="d-flex flex-column my-1">
          {errors.map(({file, error}) =>{
            return(
            <span className="p-small text-danger my-1 tran">
                {trimString(file?.name, 15)} - {getMessageError(error?.code)}
          </span>
            )})}
        </div>
      )}
    </>
  );
}
