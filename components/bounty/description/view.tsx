import { ChangeEvent } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import DragAndDrop, { IFilesProps } from "components/drag-and-drop";
import MarkedRender from "components/MarkedRender";

import { BODY_CHARACTERES_LIMIT } from "helpers/constants";

interface DescriptionViewProps {
  body: string;
  handleChangeBody: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onUpdateFiles: (files: IFilesProps[]) => void;
  onUploading?: (v: boolean) => void;
  files?: IFilesProps[];
  isEdit?: boolean;
  preview?: boolean;
  bodyLength: number;
}

export default function BountyDescriptionView({
  body,
  handleChangeBody,
  onUpdateFiles,
  onUploading,
  files,
  isEdit,
  preview,
  bodyLength,
}: DescriptionViewProps) {
  const { t } = useTranslation(["common", "bounty"]);

  return (
    <>
      <h3 className="caption-medium mb-3">{t("misc.description")}</h3>
      <div className="bg-gray-900 p-3 rounded border border-gray-800">
        <div className="p p-1">
          {isEdit && !preview ? (
            <>
              <textarea
                className={clsx("form-control", {
                  "border border-1 border-danger border-radius-8":
                    (bodyLength || body.length) > BODY_CHARACTERES_LIMIT ||
                    body.length === 0,
                })}
                placeholder={t("bounty:fields.description.placeholder")}
                value={body}
                rows={24}
                wrap="soft"
                onChange={handleChangeBody}
              />
              {(bodyLength || body.length) > BODY_CHARACTERES_LIMIT && (
                <span className="caption-small text-danger bg-opacity-100">
                  {t("bounty:errors.description-limit", {
                    value: bodyLength || body.length,
                  })}
                </span>
              )}
              <DragAndDrop
                externalFiles={files}
                onUpdateFiles={onUpdateFiles}
                onUploading={onUploading}
              />
            </>
          ) : (
            <MarkedRender source={body} />
          )}
        </div>
      </div>
    </>
  );
}
