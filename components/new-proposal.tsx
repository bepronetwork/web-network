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
  const [missingDistribution, setMissingDistribution] = useState<number>(0);
  const renderDistributionItems = distributed.map((item) => (
    <NewProposalDistributionItem
      key={item}
      by={item}
      onChange={handleChangeDistribution}
      maxValue={verifyDistribution(distributedBy)}
      InputProps={{
        isInvalid: missingDistribution,
      }}
    />
  ));
  const renderErrorDistribution = missingDistribution ? (
    <p className="p error mt-3 mb-0">
      {missingDistribution < 100
        ? missingDistribution + "% is missing!"
        : "Distribution must be equal to 100%."}
    </p>
  ) : null;

  function handleChangeDistribution(params: Object) {
    setDistributedBy((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function handleClickCreate() {
    if (sumObj(distributedBy) < 100) {
      return setMissingDistribution(verifyDistribution(distributedBy));
    }

    return setMissingDistribution(0);
  }
  function verifyDistribution(params: Object) {
    let restDistribution = 100 - sumObj(params);

    if (restDistribution > 100) {
      restDistribution = 100;
    }
    if (Number.isNaN(restDistribution) || restDistribution < 0) {
      restDistribution = 0;
    }

    return restDistribution;
  }

  return (
    <ButtonDialog
      title="New Proposal"
      footer={
        <button className="btn btn-md btn-primary" onClick={handleClickCreate}>
          Create Proposal
        </button>
      }>
      <p className="p-small emphasis-secondary new-proposal-heading">
        Select a pull request{" "}
      </p>
      <ReactSelect defaultValue={options[0]} options={options} />
      <p className="p-small emphasis-secondary new-proposal-heading mt-3">
        Propose distribution
      </p>
      <ul className="new-proposal-distribution">{renderDistributionItems}</ul>
      {renderErrorDistribution}
    </ButtonDialog>
  );
}
