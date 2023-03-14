import React, { useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import BranchsDropdown from "components/branchs-dropdown";
import Button from "components/button";
import { ContextualSpan } from "components/contextual-span";
import DescriptionPreviewModal from "components/description-preview-modal";
import DragAndDrop from "components/drag-and-drop";
import DropDown from "components/dropdown";
import InfoTooltip from "components/info-tooltip";
import ReactSelect from "components/react-select";
import ReposDropdown from "components/repos-dropdown";

import { useAppState } from "contexts/app-state";

import {
  BODY_CHARACTERES_LIMIT,
  BOUNTY_TITLE_LIMIT,
  MAX_TAGS,
} from "helpers/contants";

import { DetailsProps } from "interfaces/create-bounty";

import { useRepos } from "x-hooks/use-repos";

export default function CreateBountyDetails({
  title,
  updateTitle,
  description,
  updateDescription,
  files,
  updateFiles,
  selectedTags,
  updateSelectedTags,
  isKyc,
  updateIsKyc,
  updateTierList,
  repository,
  updateRepository,
  branch,
  updateBranch,
  updateUploading,
  review = false,
}: DetailsProps) {
  const { t } = useTranslation("bounty");

  const [strFiles, setStrFiles] = useState<string[]>([]);
  const [bodyLength, setBodyLength] = useState<number>(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const {updateActiveRepo} = useRepos();
  
  const {
    state: { Settings },
  } = useAppState();

  const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({
    label: tag,
    value: tag,
  }));

  function handleShowModal() {
    setShowPreviewModal(true);
  }

  function handleCloseModal() {
    setShowPreviewModal(false);
  }

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    updateTitle(e.target.value);
  }

  function handleChangeDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    updateDescription(e.target.value);
  }

  function handleChangeTags(newTags) {
    updateSelectedTags(newTags.map(({ value }) => value));
  }

  function handleIsKYCChecked(e: React.ChangeEvent<HTMLInputElement>) {
    updateIsKyc(e.target.checked);
  }

  useEffect(() => {
    if (description.length > 0) {
      const body = `${description}\n\n${strFiles
        .toString()
        .replace(",![", "![")
        .replace(",[", "[")}`;

      if (body?.length) setBodyLength(body.length);
    }
  }, [description, strFiles]);

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
    <>
      <div className="row justify-content-center">
        <div className="col-md-12 m-0">
          <div className="form-group">
            <label className="caption-small mb-2">
              {t("fields.title.label")}
            </label>
            <input
              type="text"
              className={clsx("form-control rounded-lg", {
                "border border-1 border-danger border-radius-8":
                  title.length >= BOUNTY_TITLE_LIMIT,
              })}
              placeholder={t("fields.title.placeholder")}
              value={title}
              onChange={handleChangeTitle}
              disabled={review}
            />
            {title.length >= BOUNTY_TITLE_LIMIT && (
              <span className="caption-small mt-3 text-danger bg-opacity-100">
                {t("errors.title-character-limit", { value: title?.length })}
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
            "border border-1 border-danger border-radius-8":
              bodyLength > BODY_CHARACTERES_LIMIT,
          })}
          rows={3}
          placeholder={t("fields.description.placeholder")}
          value={description}
          onChange={handleChangeDescription}
          disabled={review}
        />
        {bodyLength > BODY_CHARACTERES_LIMIT && (
          <span className="caption-small text-danger bg-opacity-100">
            {t("errors.description-limit", { value: bodyLength })}
          </span>
        )}

        {review && (
          <Button
            onClick={handleShowModal}
            outline
            className="mt-2 text-primary"
          >
            {t("fields.preview-descripion")}
          </Button>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="" className="caption-small mb-2">
          {t("fields.tags")}
        </label>
        <ReactSelect
          value={selectedTags.map((tag) => ({ label: tag, value: tag }))}
          options={TAGS_OPTIONS}
          onChange={handleChangeTags}
          isOptionDisabled={() => selectedTags.length >= MAX_TAGS}
          isDisabled={review}
          isMulti
        />

        {!review && (
          <ContextualSpan context="info" className="mt-1">
            {t("fields.tags-info")}
          </ContextualSpan>
        )}
      </div>

      <div>
        <DragAndDrop
          externalFiles={files}
          onUpdateFiles={updateFiles}
          onUploading={updateUploading}
          review={review}
        />
      </div>
      {!Settings?.kyc?.isKycEnabled ? (
        <>
          <div className="col-md-12 d-flex flex-row gap-2">
            <FormCheck
              className="form-control-md pb-0"
              type="checkbox"
              label={t("bounty:kyc.is-required")}
              onChange={handleIsKYCChecked}
              checked={isKyc}
            />
            <span>
              <InfoTooltip
                description={t("bounty:kyc.tool-tip")}
                secondaryIcon
              />
            </span>
          </div>
          {isKyc && !Settings?.kyc?.tierList?.length ? (
            <DropDown
              className="mt-2"
              onSelected={(opt) => {
                updateTierList(Array.isArray(opt) ? opt.map((i) => +i.value) : [+opt.value]);
              }}
              options={Settings?.kyc?.tierList.map((i) => ({
                value: i.id,
                label: i.name,
              }))}
            />
          ) : null}
        </>
      ) : null}

      <div className="mt-4">
        <h5>Github Information</h5>
        <p className="text-gray">
          Est quis sit irure exercitation id consequat cupidatat elit nulla
          velit amet ex.
        </p>
        <div className="row mt-2">
              <div className="col-6">
              <ReposDropdown
                onSelected={(opt) => {
                  updateActiveRepo(opt.value.id);
                  updateRepository(opt.value)
                  updateBranch(null)
                }}
                value={{
                  label: repository?.path,
                  value: repository,
                }}
              />
              </div>
              <div className="col-6">
              <BranchsDropdown
                repoId={repository?.id}
                onSelected={(opt) => updateBranch(opt)}
                value={branch}
              />
              </div>
        </div>
      </div>

      <DescriptionPreviewModal
        description={description}
        show={showPreviewModal && review}
        onClose={handleCloseModal}
      />
    </>
  );
}
