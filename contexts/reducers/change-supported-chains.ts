import {SimpleAction} from "./reducer";
import {SupportedChainData} from "../../interfaces/supported-chain-data";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";

export const supportedChains =
  new SimpleAction<SupportedChainData[]>(AppStateReduceId.SupportedChains, 'supportedChains');

export const changeSupportedChains = (data: SupportedChainData[]) => supportedChains.update(data);