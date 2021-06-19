import ButtonDialog from "./button-dialog";
import Select from "react-select";

const options = [
  {
    value: "Pull Request #32 by @asantos",
    label: "Pull Request #32 by @asantos",
  },
  {
    value: "Pull Request #34 by @bka",
    label: "Pull Request #34 by @bka",
  },
  {
    value: "Pull Request #36 by @alisouza",
    label: "Pull Request #36 by @alisouza",
  },
  {
    value: "Pull Request #64 by @kgb",
    label: "Pull Request #64 by @kgb",
  },
  {
    value: "Pull Request #69 by @alisa",
    label: "Pull Request #69 by @alisa",
  },
];

export default function NewProposal() {
  return (
    <ButtonDialog
      title="New Proposal"
      footer={
        <button className="btn btn-md btn-primary">Create Proposal</button>
      }>
      <p className="p-small">Select a pull request </p>
      <Select {...{ options }} />
      <p className="p-small">Propose distribution</p>
    </ButtonDialog>
  );
}
