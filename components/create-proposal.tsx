import { useEffect, useState } from "react";
import ButtonDialog from "./button-dialog";
import ReactSelect from "./react-select";
import CreateProposalDistributionItem from "./create-proposal-distribution-item";
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
  const [amount, setAmount] = useState<number>(100);
  const [error, setError] = useState<string>("");
  const renderDistribItems = distributed.map((item) => (
    <CreateProposalDistributionItem
      key={item}
      by={item}
      onChange={handleChangeDistrib}
      max={amount}
      InputProps={{
        isInvalid: !!error,
      }}
    />
  ));
  const renderErrorDistribution = error && (
    <p className="p error mt-3 mb-0">{error}</p>
  );

  useEffect(() => {
    // Must be calculated as a function and not as an object. To be fixed as (x) => x - sumObj()
    setAmount(100 - sumObj(distrib));
  }, [distrib]);
  useEffect(() => {
    setError("");
  }, [distrib]);
  function handleChangeDistrib(params: Object) {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function handleClickCreate() {
    if (amount > 0 && amount < 100) {
      return setError(`${amount}% is missing!`);
    }
    if (amount === 100) {
      return setError("Distribution must be equal to 100%.");
    }
    if (amount < 0) {
      return setError(`Distribution exceed 100%.`);
    }

    handleHide();
  }
  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
    setDistrib({});
  }

  return (
    <ButtonDialog
      title="Create Proposal"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <button className="btn btn-md btn-primary" onClick={handleClickCreate}>
          Create Proposal
        </button>
      }>
      <p className="p-small text-50">Select a pull request </p>
      <ReactSelect defaultValue={options[0]} options={options} />
      <p className="p-small mt-3">Propose distribution</p>
      <ul className="mb-0">{renderDistribItems}</ul>
      {renderErrorDistribution}
    </ButtonDialog>
  );
}
