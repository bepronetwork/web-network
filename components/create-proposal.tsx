import { useEffect, useState } from "react";
import ButtonDialog from "./button-dialog";
import ReactSelect from "./react-select";
import DistributionItem from "./distribution-item";
import sumObj from "../helpers/sumObj";

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
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setError("");
    setAmount(sumObj(distrib));
  }, [distrib]);
  function handleChangeDistrib(params: Object) {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function handleClickCreate() {
    if (amount > 0 && amount < 100) {
      return setError(`${100 - amount}% is missing!`);
    }
    if (amount === 0) {
      return setError("Distribution must be equal to 100%.");
    }
    if (amount > 100) {
      return setError("Distribution exceed 100%.");
    }
  }

  return (
    <ButtonDialog
      title="Create Proposal"
      className="btn-primary me-2"
      footer={({ hideModal }) => (
        <>
          <button className="btn btn-md btn-opac" onClick={hideModal}>
            Cancel
          </button>
          <button
            className="btn btn-md btn-primary"
            onClick={() => {
              handleClickCreate();

              if (amount === 100 && !error) {
                hideModal();
                setDistrib({});
              }
            }}>
            Create Proposal
          </button>
        </>
      )}>
      <p className="p-small text-50">Select a pull request </p>
      <ReactSelect defaultValue={options[0]} options={options} />
      <p className="p-small mt-3">Propose distribution</p>
      <ul className="mb-0">
        {distributed.map((item) => (
          <DistributionItem
            key={item}
            by={item}
            onChange={handleChangeDistrib}
            InputProps={{
              isInvalid: !!error,
            }}
          />
        ))}
      </ul>
      {error && <p className="p error mt-3 mb-0">{error}</p>}
    </ButtonDialog>
  );
}
