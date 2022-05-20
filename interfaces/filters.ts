export interface IssueFilterBoxOption {
  label: string;
  value: any; //eslint-disable-line
  checked: boolean;
}

export interface IssueFilterBoxParams {
  title: string;
  options: IssueFilterBoxOption[];
  onChange?: (option: IssueFilterBoxOption, newValue: boolean) => void;
  type?: "radio" | "checkbox";
  className?: string;
  filterPlaceholder?: string;
}
