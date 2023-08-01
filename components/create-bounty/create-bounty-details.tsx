import React, { useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import BranchsDropdown from "components/branchs-dropdown";
import { ContextualSpan } from "components/contextual-span";
import DropDown from "components/dropdown";
import InfoTooltip from "components/info-tooltip";
import ReactSelect from "components/react-select";
import ReposDropdown from "components/repos-dropdown";

import { useAppState } from "contexts/app-state";

import {
  BOUNTY_TITLE_LIMIT,
  MAX_TAGS,
} from "helpers/constants";

import { DetailsProps } from "interfaces/create-bounty";

import useOctokit from "x-hooks/use-octokit";

import CreateBountyDescription from "./create-bounty-description";
import BountyLabel from "./create-bounty-label";

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
  repositories,
  branches,
  updateBranches,
  updateUploading,
}: DetailsProps) {
  const { t } = useTranslation("bounty");

  const [strFiles, setStrFiles] = useState<string[]>([]);
  const [bodyLength, setBodyLength] = useState<number>(0);
  
  const {
    state: { Settings },
  } = useAppState();

  const { getRepositoryBranches } = useOctokit();

  const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({
    label: tag,
    value: tag,
  }));

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

  function handleSelectedRepo(opt: {
    value: {
      id: string;
      path: string;
    };
  }) {
    updateRepository(opt.value);
    getRepositoryBranches(opt.value.path, true).then((b) =>
      updateBranches(b.branches));
    updateBranch(null);
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
      <div className="mt-2 mb-4">
        <h5>{t("steps.details")}</h5>
        <p className="text-gray">
          {t("descriptions.details")}
        </p>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-12 m-0 mb-2">
          <div className="form-group">
            <BountyLabel className="mb-2" required>
              {t("fields.title.label")}
            </BountyLabel>
            <input
              type="text"
              className={clsx("form-control form-bounty rounded-lg", {
                "border border-1 border-danger border-radius-8":
                  title.length >= BOUNTY_TITLE_LIMIT,
              })}
              placeholder={t("fields.title.placeholder")}
              value={title}
              onChange={handleChangeTitle}
            />
            {title.length >= BOUNTY_TITLE_LIMIT && (
              <span className="caption-small mt-3 text-danger bg-opacity-100">
                {t("errors.title-character-limit", { value: title?.length })}
              </span>
            )}   
          </div>
        </div>
      </div>

      <div className="form-group">
        <CreateBountyDescription 
          description={description}
          handleChangeDescription={handleChangeDescription}
          bodyLength={bodyLength}
          files={files}
          updateFiles={updateFiles}
          updateUploading={updateUploading}
        />
      </div>
      <span className="text-gray">
      {t("finding-yourself-lost")}
        <a tabIndex={3} href="/explore" target="_blank" className="ms-1">
          {t("bounty-examples")}
        </a>
      </span>

      <div className="form-group mt-4">
        <label htmlFor="" className="mb-2">
          {t("fields.tags")}
        </label>
        <ReactSelect
          value={selectedTags.map((tag) => ({ label: tag, value: tag }))}
          options={TAGS_OPTIONS}
          onChange={handleChangeTags}
          isOptionDisabled={() => selectedTags.length >= MAX_TAGS}
          isMulti
        />
          <ContextualSpan context="info" className="mt-1">
            {t("fields.tags-info")}
          </ContextualSpan>
      </div>
      {Settings?.kyc?.isKycEnabled ? (
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
          {isKyc && Settings?.kyc?.tierList?.length ? (
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
      <div className="border-top border-gray-700 my-4"/>
      <div className="mt-4">
        <h5>{t("steps.github")}</h5>
        <p className="text-gray">{t("descriptions.github")}</p>
        <div className="row">
              <div className="col-md-6 mt-2">   
              <ReposDropdown
                repositories={repositories}
                onSelected={handleSelectedRepo}
                value={{
                  label: repository?.path,
                  value: repository,
                }}
              />
              </div>
              <div className="col-md-6 mt-2">
              <BranchsDropdown
                branches={branches}
                onSelected={updateBranch}
                value={branch}
              />
              </div>
        </div>
      </div>
    </>
  );
}
