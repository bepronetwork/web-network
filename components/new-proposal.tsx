import { useEffect, useState } from "react";
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
  const [amount, setAmount] = useState<number>(100);
  const [error, setError] = useState<string>("");
  const renderDistribItems = distributed.map((item) => (
    <NewProposalDistributionItem
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

  console.log({ amount });

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
    if (amount === 100) {
      return setError("Distribution must be equal to 100%.");
    }
    if (amount > 0 && amount < 100) {
      return setError(`${amount}% is missing!`);
    }

    setDistrib({});
    handleHide();
  }
  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

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
        Propose distribution
      </p>
      <ul className="new-proposal-distribution">{renderDistribItems}</ul>
      {renderErrorDistribution}
    </ButtonDialog>
  );
}
