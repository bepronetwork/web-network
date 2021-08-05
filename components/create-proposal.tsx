import { useEffect, useState } from "react";
import Modal from "./modal";
import ReactSelect from "./react-select";
import CreateProposalDistributionItem from "./create-proposal-distribution-item";
import sumObj from "helpers/sumObj";
import BeproService from "../services/bepro";

const options = [
  "Pull Request #32 by @asantos",
  "Pull Request #34 by @bka",
  "Pull Request #36 by @alisouza",
  "Pull Request #64 by @kgb",
  "Pull Request #69 by @alisa",
  "Pull Request #69 by @alisa",
];
const distributed = [
  {
    handlegithub: "@ruipedro",
    adress: "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
  },
  {
    handlegithub: "@moshmage",
    adress: "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
  },
  {
    handlegithub: "@marcusvinicius",
    adress: "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
  },
];

export default function NewProposal({ issueId, amountTotal }) {
  const [distrib, setDistrib] = useState<Object>({});
  const [amount, setAmount] = useState<number>();
  const [error, setError] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setError("");
    setAmount(sumObj(distrib));
  }, [distrib]);
  function handleChangeDistrib(params: { [key: string]: number }): void {
    console.log("params->", params);
    setDistrib((prevState) => ({
      ...prevState,
      ...params,
    }));
  }

  async function handleClickCreate(): Promise<void> {
    if (amount > 0 && amount < 100) {
      return setError(`${100 - amount}% is missing!`);
    }
    if (amount === 0) {
      return setError("Distribution must be equal to 100%.");
    }
    if (amount > 100) {
      return setError("Distribution exceed 100%.");
    }
    const propose = await BeproService.network.proposeIssueMerge({
      issueID: issueId,
      prAddresses: [
        "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
        "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
        "0x8E3c42FA292a187865b466f05d7EBbFe77f1CF5d",
      ],
      prAmounts: [
        (amountTotal * distrib[distributed[0].handlegithub]) / 100,
        (amountTotal * distrib[distributed[1].handlegithub]) / 100,
        (amountTotal * distrib[distributed[2].handlegithub]) / 100,
      ],
    });
    console.log("propsoe,", propose);
    handleClose();
    setDistrib({});
  }
  function handleClose() {
    setShow(false);
  }

  return (
    <>
      <button className="btn btn-md btn-primary" onClick={() => setShow(true)}>
        Create Proposal
      </button>
      <Modal
        show={show}
        title="Create Proposal"
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-md btn-primary"
              onClick={handleClickCreate}
            >
              Create Proposal
            </button>
          </>
        }
      >
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
          {distributed.map((item) => (
            <CreateProposalDistributionItem
              key={item.handlegithub}
              by={item.handlegithub}
              onChangeDistribution={handleChangeDistrib}
              error={error}
            />
          ))}
        </ul>
        {error && <p className="p error mt-3 mb-0 text-danger">{error}</p>}
      </Modal>
    </>
  );
}
