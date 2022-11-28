import {SimpleAction} from "./reducer";
import {SupportedChainData} from "../../interfaces/supported-chain-data";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";

export const changeSupportedChains =
  new SimpleAction<SupportedChainData[]>(AppStateReduceId.SupportedChains, 'supportedChains');

export const updateSupportedChains = (data: SupportedChainData[]) => changeSupportedChains.update(data);