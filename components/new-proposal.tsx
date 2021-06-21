import { useState } from "react";
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
  const [show, setShow] = useState<boolean>(false);
  const [distrib, setDistrib] = useState<Object>({});
  const [missingDistrib, setMissingDistrib] = useState<number>(0);
  const renderDistribItems = distributed.map((item) => (
    <NewProposalDistributionItem
      key={item}
      by={item}
      onChange={handleChangeDistrib}
      onBlur={handleBlurDistrib}
      maxValue={restDistrib(distrib)}
      InputProps={{
        isInvalid: missingDistrib,
      }}
    />
  ));
  const renderErrorDistribution = missingDistrib ? (
    <p className="p error mt-3 mb-0">
      {missingDistrib < 100
        ? missingDistrib + "% is missing!"
        : "Distribution must be equal to 100%."}
    </p>
  ) : null;

  function handleBlurDistrib() {
    setMissingDistrib(0);
  }
  function handleChangeDistrib(params: Object) {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function handleClickCreate() {
    if (sumObj(distrib) < 100) {
      return setMissingDistrib(restDistrib(distrib));
    }
    resetDistrib();
    handleHide();
  }
  function restDistrib(params: Object) {
    let restDistrib = 100 - sumObj(params);

    if (restDistrib > 100) {
      restDistrib = 100;
    }
    if (Number.isNaN(restDistrib) || restDistrib < 0) {
      restDistrib = 0;
    }

    return restDistrib;
  }
  function resetDistrib() {
    setDistrib({});
    setMissingDistrib(0);
  }
  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

  console.log({
    distrib,
    missingDistrib,
    restDistrib: restDistrib(distrib),
  });

  return (
    <ButtonDialog
      title="New Proposal"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
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
        Propose distrib
      </p>
      <ul className="new-proposal-distrib">{renderDistribItems}</ul>
      {renderErrorDistribution}
    </ButtonDialog>
  );
}
