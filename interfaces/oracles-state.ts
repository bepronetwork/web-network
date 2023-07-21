import { ChangeEvent, MutableRefObject, ReactElement } from "react";
import { NumberFormatValues } from "react-number-format";

import { OraclesResume, Delegation } from "@taikai/dappkit";
import BigNumber from "bignumber.js";

import { Wallet } from "./authentication";
import { TransactionTypes } from "./enums/transaction-types";

export type OraclesActionLabel = "Lock" | "Unlock";
export interface OraclesState {
  oraclesDelegatedByOthers: number;
  amounts: number[];
  addresses: string[];
  tokensLocked: number;
  delegatedToOthers?: number;
  delegatedEntries?: [string, number][];
}

export interface DelegationExtended extends Delegation {
  id: number;
  from: string;
  to: string;
  amount: BigNumber;
}

export interface OraclesResumeExtended extends OraclesResume {
  locked: BigNumber;
  delegatedToOthers: BigNumber;
  delegatedByOthers: BigNumber;
  delegations: DelegationExtended[];
}

export interface OracleToken {
  symbol: string;
  name: string;
  icon: ReactElement;
}

export interface TokensOracles {
  symbol: string;
  name: string;
  networkName: string;
  icon: string | ReactElement;
  oraclesLocked: BigNumber;
  address: string;
}

interface Info {
  title: string;
  description: string;
  label: string;
  caption: ReactElement;
  body: string;
  params: (from?: string) => { tokenAmount: string; from?: string };
}

export interface OraclesActionsViewProps {
  wallet: Wallet;
  actions: string[];
  action: string;
  handleAction: (v: string) => void;
  renderInfo: Info;
  currentLabel: string;
  networkTokenSymbol: string;
  error: string;
  tokenAmount: string;
  handleChangeToken: (v: NumberFormatValues) => void;
  networkTokenDecimals: number;
  getMaxAmount: (trueValue?: boolean) => string;
  handleMaxAmount: () => void;
  needsApproval: boolean;
  isApproving: boolean;
  approveSettlerToken: () => void;
  verifyTransactionState: (type: TransactionTypes) => boolean;
  isButtonDisabled: boolean;
  handleCheck: () => void;
  txType: TransactionTypes.lock | TransactionTypes.unlock;
  handleProcessEvent: (blockNumber: string | number) => void;
  onSuccess: () => void;
  handleError: (m?: string) => void;
  networkTxRef: MutableRefObject<HTMLButtonElement>;
  show: boolean;
  handleCancel: () => void;
  handleConfirm: () => void;
}

export interface OraclesActionsProps {
  wallet: Wallet;
  updateWalletBalance: () => void;
}

export interface ModalOraclesActionViewProps {
    renderInfo: Info;
    show: boolean;
    handleCancel: () => void;
    handleConfirm: () => void;
}

export interface OraclesDelegateViewProps {
  tokenAmount: string
  handleChangeOracles: (params: NumberFormatValues) => void;
  error: string;
  networkTokenDecimals: number;
  availableAmount: BigNumber;
  handleMaxAmount: () => void;
  delegatedTo: string;
  handleChangeAddress: (params: ChangeEvent<HTMLInputElement>) => void;
  isAddressesEqual: boolean;
  addressError: string;
  networkTokenSymbol: string;
  handleClickVerification: () => void;
  handleProcessEvent: (blockNumber: number | string) => void;
  handleTransition: () => void;
  handleError: (m?: string) => void; 
  isButtonDisabled: boolean;
}

export interface OraclesDelegateProps {
  wallet: Wallet;
  updateWalletBalance: () => void;
  defaultAddress?: string;
}