import { useEffect, useState } from "react";
import ButtonDialog from "./button-dialog";
import ReactSelect from "./react-select";
import DistributionItem from "./distribution-item";
import sumObj from "helpers/sumObj";

const options = [
  "Pull Request #32 by @asantos",
  "Pull Request #34 by @bka",
  "Pull Request #36 by @alisouza",
  "Pull Request #64 by @kgb",
  "Pull Request #69 by @alisa",
  "Pull Request #69 by @alisa",
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
  function handleChangeDistrib(params: { [key: string]: number }): void {
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }
  function renderFooter({ hideModal }) {
    function handleClickCreate(): void {
      if (amount > 0 && amount < 100) {
        return setError(`${100 - amount}% is missing!`);
      }
      if (amount === 0) {
        return setError("Distribution must be equal to 100%.");
      }
      if (amount > 100) {
        return setError("Distribution exceed 100%.");
      }

      hideModal();
      setDistrib({});
    }

    return (
      <>
        <button className="btn btn-md btn-opac" onClick={hideModal}>
          Cancel
        </button>
        <button className="btn btn-md btn-primary" onClick={handleClickCreate}>
          Create Proposal
        </button>
      </>
    );
  }

  return (
    <ButtonDialog title="Create Proposal" footer={renderFooter}>
      <p className="p-small text-50">Select a pull request </p>
      <ReactSelect
        defaultValue={{
          value: options[0],
          label: options[0],
        }}
        options={options.map((value) => ({
          value,
          label: value,
        }))}
      />
      <p className="p-small mt-3">Propose distribution</p>
      <ul className="mb-0">
        {distributed.map((item: string) => (
          <DistributionItem
            key={item}
            by={item}
            onChangeDistribution={handleChangeDistrib}
            error={error}
          />
        ))}
      </ul>
      {error && <p className="p error mt-3 mb-0 text-danger">{error}</p>}
    </ButtonDialog>
  );
}
