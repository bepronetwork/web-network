import {useState} from "react";
import {components as RSComponents, SingleValueProps} from "react-select";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import Avatar from "components/avatar";
import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import { truncateAddress } from "helpers/truncate-address";

import {NetworkEvents} from "interfaces/enums/events";
import {Deliverable, IssueBigNumberData} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

function SingleValue (props: SingleValueProps<any>) {
  const data = props.getValue()[0];
  return (
  <RSComponents.SingleValue {...props}>
    <div className="d-flex align-items-center p-1">
      <Avatar userLogin={data?.githubLogin} />
      <span className="ml-1 text-nowrap">{data?.label}</span>
    </div>
  </RSComponents.SingleValue>
  )
}

function SelectOptionComponent({ innerProps, innerRef, data }) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="proposal__select-options d-flex align-items-center text-center p-small p-1"
    >
      <Avatar userLogin={data?.githubLogin} />
      <span
        className={`ml-1 text-nowrap ${
          data.isDisable ? "text-light-gray" : "text-gray hover-primary"
        }`}
      >
        {data?.label}
      </span>
    </div>
  );
}

interface ProposalModalProps {
  amountTotal: BigNumber | string | number;
  deliverables: Deliverable[];
  show: boolean;
  onCloseClick: () => void;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

export default function ProposalModal({
  amountTotal,
  deliverables = [],
  show,
  onCloseClick,
  currentBounty,
  updateBountyData
}: ProposalModalProps) {
  const { t } = useTranslation([
    "common",
    "bounty",
    "proposal",
    "deliverable"
  ]);

  const [executing, setExecuting] = useState<boolean>(false);
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();

  const {state} = useAppState();

  const { processEvent } = useApi();
  const { handleProposeMerge } = useBepro();

  async function handleClickCreate(): Promise<void> {
    if (!currentDeliverable) return;

    const prCreator = currentDeliverable.user?.address;

    setExecuting(true);

    handleProposeMerge(+currentBounty.contractId, +currentDeliverable.prContractId, [prCreator], [100])
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        return processEvent(NetworkEvents.ProposalCreated, undefined, { fromBlock });
      })
      .then(() => {
        handleClose();
        setExecuting(false);
        updateBountyData();
      });
  }

  function handleClose() {
    onCloseClick();
  }

  function handleChangeSelect({ value }) {
    const newDeliverable = deliverables.find((el) => el.id === value);
    if (newDeliverable)
      setCurrentDeliverable(newDeliverable);
  }

  function deliverableToOption(deliverable: Deliverable) {
    if (!deliverable) return;

    return {
      value: deliverable?.id,
      label: `Deliverable #${deliverable?.id} ${t("misc.by")} @${truncateAddress(deliverable?.user?.address)}`,
      address: deliverable?.user?.address,
      githubLogin: deliverable?.user?.githubLogin
    }
  }

  return (
    <div className="d-flex">
      <Modal
        show={show}
        title={t("proposal:actions.new")}
        titlePosition="center"
        onCloseClick={handleClose}
        footer={
          <div className="d-flex justify-content-between">
            <Button color="dark-gray" onClick={handleClose}>
              {t("actions.cancel")}
            </Button>
            <ContractButton
              onClick={handleClickCreate}
              disabled={!state.currentUser?.walletAddress || executing}
              isLoading={executing}
              withLockIcon={!state.currentUser?.walletAddress}
            >
              <span>{t("proposal:actions.create")}</span>
            </ContractButton>
          </div>
        }>
        <p className="caption-small text-white-50 mb-2 mt-2">
          {t("deliverable:select")}
        </p>
        <ReactSelect
          id="deliverableSelect"
          components={{
            Option: SelectOptionComponent,
            SingleValue
          }}
          placeholder={t("forms.select-placeholder")}
          value={deliverableToOption(currentDeliverable)}
          options={deliverables?.map(deliverableToOption)}
          isOptionDisabled={(option) => option.isDisable}
          onChange={handleChangeSelect}
          isSearchable={false}
        />
      </Modal>
    </div>
  );
}
