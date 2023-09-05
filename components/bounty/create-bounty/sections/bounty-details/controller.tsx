import { useEffect, useState, ChangeEvent } from "react";

import { useTranslation } from "next-i18next";

import { PROGRAMMING_LANGUAGES } from "assets/bounty-labels";

import BountyDetailsSectionView from "components/bounty/create-bounty/sections/bounty-details/view";

import { useAppState } from "contexts/app-state";

import {
  BOUNTY_TITLE_LIMIT,
  MAX_TAGS,
} from "helpers/constants";

import { BountyDetailsSectionProps } from "interfaces/create-bounty";

import { SelectOption } from "types/utils";

export default function BountyDetailsSection({
  title,
  updateTitle,
  description,
  updateDescription,
  files,
  updateFiles,
  selectedTags,
  updateSelectedTags,
  isKyc,
  originLink,
  isOriginLinkBanned,
  deliverableType,
  onOriginLinkChange,
  updateIsKyc,
  updateTierList,
  updateUploading,
  setDeliverableType
}: BountyDetailsSectionProps) {
  const { t } = useTranslation("bounty");

  const [strFiles, setStrFiles] = useState<string[]>([]);
  const [bodyLength, setBodyLength] = useState<number>(0);
  
  const {
    state: { Settings },
  } = useAppState();

  const TAGS_OPTIONS = PROGRAMMING_LANGUAGES.map(({ tag }) => ({
    label: tag,
    value: tag,
  }));

  const kycTierOptions = Settings?.kyc?.tierList?.map((i) => ({
    value: i.id,
    label: i.name,
  }));

  const deliverableTypes = [
    { label: t("fields.deliverable-types.types.code"), value: "code" },
    { label: t("fields.deliverable-types.types.design"), value: "design" },
    { label: t("fields.deliverable-types.types.other"), value: "other" }
  ];

  function handleChangeTitle(e: ChangeEvent<HTMLInputElement>) {
    updateTitle(e.target.value);
  }

  function handleChangeDescription(e: ChangeEvent<HTMLTextAreaElement>) {
    updateDescription(e.target.value);
  }

  function handleChangeTags(newTags) {
    updateSelectedTags(newTags.map(({ value }) => value));
  }

  function handleIsKYCChecked(e: ChangeEvent<HTMLInputElement>) {
    updateIsKyc(e.target.checked);
  }
  
  function handleDeliverableTypeClick(selected: SelectOption | SelectOption[]) {
    const selectedType = Array.isArray(selected) ? selected.at(0) : selected;

    setDeliverableType(selectedType?.value?.toString());
  }

  function handleOriginLinkChange(e: ChangeEvent<HTMLInputElement>) {
    onOriginLinkChange(e.target.value)
  }

  function onKycTierChange(opt) {
    updateTierList(Array.isArray(opt) ? opt.map((i) => +i.value) : [+opt.value]);
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
    <BountyDetailsSectionView
      title={title}
      description={description}
      files={files}
      bodyLength={bodyLength}
      tags={selectedTags.map((tag) => ({ label: tag, value: tag }))}
      tagsOptions={TAGS_OPTIONS}
      titleExceedsLimit={title?.length >= BOUNTY_TITLE_LIMIT}
      kycCheck={isKyc}
      isKycEnabled={Settings?.kyc?.isKycEnabled}
      kycOptions={kycTierOptions}
      deliverableTypeOptions={deliverableTypes}
      deliverableType={deliverableType}
      originLink={originLink}
      isOriginLinkBanned={isOriginLinkBanned}
      onTitlechange={handleChangeTitle}
      onDescriptionchange={handleChangeDescription}
      onFilesChange={updateFiles}
      setIsUploadingFiles={updateUploading}
      onTagsChange={handleChangeTags}
      isTagsSelectDisabled={() => selectedTags.length >= MAX_TAGS}
      onKycCheckChange={handleIsKYCChecked}
      onKycTierChange={onKycTierChange}
      onDeliverableTypeClick={handleDeliverableTypeClick}
      onOriginLinkchange={handleOriginLinkChange}
    />
  );
}
