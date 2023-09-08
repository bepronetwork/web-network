import { IFilesProps } from "components/drag-and-drop";

import { OriginLinkErrors } from "./enums/Errors";

export interface BountyDetailsSectionProps {
  title: string;
  updateTitle: (e: string) => void;
  description: string;
  updateDescription: (e: string) => void;
  files: IFilesProps[];
  updateFiles: (files: IFilesProps[]) => void;
  selectedTags: string[];
  updateSelectedTags: (e: string[]) => void;
  isKyc: boolean;
  originLink: string;
  deliverableType: string;
  originLinkError?: OriginLinkErrors;
  onOriginLinkChange: (link: string) => void;
  updateIsKyc: (e: boolean) => void;
  updateTierList: (e: number[]) => void;
  updateUploading: (e: boolean) => void;
  setDeliverableType: (type: string) => void;
}
export interface BountyPayload {
  title: string;
  cid: string | boolean;
  transactional: string;
  tokenAmount: string;
  rewardToken?: string;
  rewardAmount?: string;
  fundingAmount?: string;
}
