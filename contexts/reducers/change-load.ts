import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {LoadingState} from "../../interfaces/loading-state";
import {SimpleAction} from "./reducer";

export const changeLoad = new SimpleAction<LoadingState>(AppStateReduceId.Loading, 'loading');
export const changeLoadState = (isLoading: boolean, text?: string) => changeLoad.update({isLoading, text});