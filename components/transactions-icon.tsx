import HelpIcon from "assets/icons/help-icon";
import { ApprovalIcon } from "assets/icons/transactions/approval";
import CancelIcon from "assets/icons/transactions/cancel";
import CompleteIcon from "assets/icons/transactions/complete";
import { ContestIcon } from "assets/icons/transactions/contest";
import CurrencyIcon from "assets/icons/transactions/currency";
import { DelegateIcon } from "assets/icons/transactions/delegate";
import DeliverableIcon from "assets/icons/transactions/deliverable";
import EditIcon from "assets/icons/transactions/edit";
import { LockIcon } from "assets/icons/transactions/lock";
import MergeIcon from "assets/icons/transactions/merge";
import { OpenBountyIcon } from "assets/icons/transactions/open-bounty";
import ReadyIcon from "assets/icons/transactions/ready";
import SettingsIcon from "assets/icons/transactions/settings";
import { TakeBackIcon } from "assets/icons/transactions/take-back";
import { UnlockIcon } from "assets/icons/transactions/unlock";
import UpdateIcon from "assets/icons/transactions/update";

import { TransactionTypes } from "interfaces/enums/transaction-types";

interface TransactionIconProps {
  type: TransactionTypes;
}

export function TransactionIcon({ type } : TransactionIconProps) {
  const icons = {
    [TransactionTypes.lock]: <LockIcon />,
    [TransactionTypes.unlock]: <UnlockIcon />,
    [TransactionTypes.approveTransactionalERC20Token]: <ApprovalIcon />,
    [TransactionTypes.openIssue]: <OpenBountyIcon />,
    [TransactionTypes.delegateOracles]: <DelegateIcon />,
    [TransactionTypes.takeBackOracles]: <TakeBackIcon />,
    [TransactionTypes.dispute]: <ContestIcon />,
    [TransactionTypes.proposeMerge]: <MergeIcon />,
    [TransactionTypes.closeIssue]: <CompleteIcon />,
    [TransactionTypes.redeemIssue]: <CancelIcon />,
    [TransactionTypes.approveSettlerToken]: <ApprovalIcon />,
    [TransactionTypes.recognizedAsFinish]: <ReadyIcon />,
    [TransactionTypes.createDeliverable]: <DeliverableIcon />,
    [TransactionTypes.makeDeliverableReady]: <ReadyIcon />,
    [TransactionTypes.updateBountyAmount]: <UpdateIcon />,
    [TransactionTypes.cancelDeliverable]: <CancelIcon />,
    [TransactionTypes.refuseProposal]: <ContestIcon />,
    [TransactionTypes.deployNetworkV2]: <CurrencyIcon />,
    [TransactionTypes.setNFTDispatcher]: <SettingsIcon />,
    [TransactionTypes.addNetworkToRegistry]: <EditIcon />,
    [TransactionTypes.deployBountyToken]: <CurrencyIcon />,
    [TransactionTypes.setDraftTime]: <SettingsIcon />,
    [TransactionTypes.setDisputableTime]: <SettingsIcon />,
    [TransactionTypes.setPercentageNeededForDispute]: <SettingsIcon />,
    [TransactionTypes.setCouncilAmount]: <SettingsIcon />,
    [TransactionTypes.setCancelableTime]: <SettingsIcon />,
    [TransactionTypes.setOracleExchangeRate]: <SettingsIcon />,
    [TransactionTypes.setMergeCreatorFeeShare]: <SettingsIcon />,
    [TransactionTypes.setProposerFeeShare]: <SettingsIcon />,
    [TransactionTypes.fundBounty]: <CurrencyIcon />,
    [TransactionTypes.retractFundBounty]: <TakeBackIcon />,
    [TransactionTypes.withdrawFundRewardBounty]: <CurrencyIcon />,
    [TransactionTypes.deployERC20Token]: <CurrencyIcon />,
    [TransactionTypes.configFees]: <SettingsIcon />,
    [TransactionTypes.deployNetworkRegistry]: <CurrencyIcon />,
    [TransactionTypes.changeAllowedTokens]: <SettingsIcon />,
    [TransactionTypes.closeNetwork]: <CancelIcon />,
    [TransactionTypes.amountForNetworkCreation]: <SettingsIcon />,
    [TransactionTypes.feeForNetworkCreation]: <SettingsIcon />
  };

  if (icons[type]) return icons[type];

  return <HelpIcon />;
}