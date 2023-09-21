import {useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Badge from "components/badge";
import NewProposalModalView from "components/proposal/new-proposal-modal/view";

import {useAppState} from "contexts/app-state";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { truncateAddress } from "helpers/truncate-address";

import {NetworkEvents} from "interfaces/enums/events";
import {Deliverable, IssueBigNumberData} from "interfaces/issue-data";

import { PaymentInfoProps } from "types/components";

import useBepro from "x-hooks/use-bepro";
import useContractTransaction from "x-hooks/use-contract-transaction";

interface ProposalModalProps {
  deliverables: Deliverable[];
  show: boolean;
  onCloseClick: () => void;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

export default function ProposalModal({
  deliverables = [],
  show,
  onCloseClick,
  currentBounty,
  updateBountyData
}: ProposalModalProps) {
  const { t } = useTranslation("proposal");
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();

  const { state } = useAppState();
  const { handleProposeMerge } = useBepro();
  const [isExecuting, onCreateProposal] = useContractTransaction( NetworkEvents.ProposalCreated,
                                                                  handleProposeMerge,
                                                                  t("messages.proposal-created"),
                                                                  t("errors.failed-to-create"));

  const { treasury, mergeCreatorFeeShare, proposerFeeShare } = state.Service?.network?.amounts || {};
  const deliverableUserAddress = currentDeliverable?.user?.address;
  const deliverableUserLogin = currentDeliverable?.user?.githubLogin;
  const distributedAmounts = treasury ? calculateDistributedAmounts(treasury,
                                                                    mergeCreatorFeeShare,
                                                                    proposerFeeShare,
                                                                    BigNumber(currentBounty?.amount),
                                                                    [
                                                                      {
                                                                        recipient: deliverableUserAddress, 
                                                                        percentage: 100
                                                                      }
                                                                    ]) : null;
  const paymentInfos: PaymentInfoProps[] = [
    {
      address: deliverableUserAddress,
      login: deliverableUserLogin,
      amount: distributedAmounts?.proposals?.at(0)?.value,
      symbol: currentBounty?.transactionalToken?.symbol,
      percentage: distributedAmounts?.proposals?.at(0)?.percentage,
      label: t("create-modal.deliverable-creator"),
    },
    {
      address: state.currentUser?.walletAddress,
      login: state.currentUser?.login,
      amount: distributedAmounts?.proposerAmount?.value,
      symbol: currentBounty?.transactionalToken?.symbol,
      percentage: distributedAmounts?.proposerAmount?.percentage,
      label: t("create-modal.proposal-creator"),
    }
  ];

  async function handleClickCreate(): Promise<void> {
    if (!currentDeliverable) return;

    const deliverableCreator = currentDeliverable.user?.address;

    onCreateProposal(+currentBounty.contractId, +currentDeliverable.prContractId, deliverableCreator)
      .then(() => {
        handleClose();
        updateBountyData();
      });
  }

  function handleClose() {
    onCloseClick();
    setCurrentDeliverable(undefined);
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
      spaceBetween: true,
      label:  <div className="d-flex flex-column">
                <span className="sm-regular text-white text-capitalize text-overflow-ellipsis">
                  {deliverable?.title}
                </span>
                <div className="d-flex align-items-center mt-1 gap-2">
                  <AvatarOrIdenticon
                    address={deliverable?.user?.address}
                    user={deliverable?.user?.githubLogin}
                    size="xsm"
                  />
                  <span className="xs-small text-gray-500 font-weight-normal text-capitalize">
                    {deliverable?.user?.githubLogin ?? truncateAddress(deliverable?.user?.address)}
                  </span>
                </div>
              </div>,
      postIcon: <Badge 
                  label={currentBounty?.type} 
                  className="xs-small bg-primary bg-opacity-25 border border-primary font-weight-normal text-capitalize"
                />
    }
  }

  return(
    <NewProposalModalView
      show={show}
      isExecuting={isExecuting}
      isConnected={!!state.currentUser?.walletAddress}
      selectedDeliverable={deliverableToOption(currentDeliverable)}
      deliverablesOptions={deliverables?.filter(d => d?.markedReadyForReview)?.map(deliverableToOption)}
      deliverableUrl={currentDeliverable?.deliverableUrl}
      paymentInfos={distributedAmounts ? paymentInfos : null}
      onClose={handleClose}
      onSubmit={handleClickCreate}
      onDeliverableChange={handleChangeSelect}
    />
  );
}
