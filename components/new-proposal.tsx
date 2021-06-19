import { useState } from "react";
import { Form } from "react-bootstrap";
import ButtonDialog from "./button-dialog";
import ReactSelect from "./react-select";
import NewProposalDistributionItem from "./new-proposal-distribution-item";
import { sumObj } from "../services/helpers";

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
const distributed = ["@asantos", "@vazTros", "@MikeSon"];

export default function NewProposal() {
  const [distributedBy, setDistributedBy] = useState<Object>({});
  const renderDistributionItems = distributed.map((item) => (
    <NewProposalDistributionItem
      key={item}
      by={item}
      onChange={handleChangeDistribution}
      InputProps={{ max: 100 - sumObj(distributedBy) }}
    />
  ));

  console.log(100 - sumObj(distributedBy));

  function handleChangeDistribution(params: Object) {
    setDistributedBy((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function handleClickCreate() {}

  return (
    <ButtonDialog
      title="New Proposal"
      footer={
        <button className="btn btn-md btn-primary" onClick={handleClickCreate}>
          Create Proposal
        </button>
      }>
      <p className="p-small emphasis-secondary">Select a pull request </p>
      <ReactSelect defaultValue={options[0]} options={options} />
      <p className="p-small emphasis-secondary">Propose distribution</p>
      <ul>{renderDistributionItems}</ul>
    </ButtonDialog>
  );
}
