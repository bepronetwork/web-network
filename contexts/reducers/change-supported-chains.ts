import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SupportedChainData} from "../../interfaces/supported-chain-data";
import {SimpleAction} from "./reducer";

export const changeSupportedChains =
  new SimpleAction<SupportedChainData[]>(AppStateReduceId.SupportedChains, 'supportedChains');

export const updateSupportedChains = (data: SupportedChainData[]) => changeSupportedChains.update(data);