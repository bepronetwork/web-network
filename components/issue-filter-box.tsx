interface IssueFilterBoxParams {
  title: string;
  options: { label: string; value: any }[];
  onChange: (option: { label: string, value: any }) => void
}


export default function IssueFilterBox({title, options = [], onChange = (option) => {}}: IssueFilterBoxParams) {
  return <div>

  </div>
}
