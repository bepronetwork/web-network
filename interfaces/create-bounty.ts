import { IFilesProps } from "components/drag-and-drop";

export interface Repository {
    id: string; 
    path: string
}

export interface Branch {
     value: string;
     label: string 
}

export interface DetailsProps {
  title: string;
  updateTitle: (e: string) => void;
  description: string;
  updateDescription: (e: string) => void;
  files: IFilesProps[];
  updateFiles: (files: IFilesProps[]) => void;
  selectedTags: string[];
  updateSelectedTags: (e: string[]) => void;
  isKyc: boolean;
  updateIsKyc: (e: boolean) => void;
  updateTierList: (e: number[]) => void;
  repository: Repository;
  updateRepository: (e: Repository) => void;
  branch?: Branch;
  updateBranch?: (e: Branch) => void;
  review?: boolean;
  updateUploading: (e: boolean) => void;
}
