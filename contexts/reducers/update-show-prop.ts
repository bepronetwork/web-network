import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";


interface ShowProps {
  web3Dialog?: boolean;
  createBounty?: boolean;

  [k: string]: boolean
}

export const changeShowProp = new SimpleAction<ShowProps>(AppStateReduceId.Show, 'show');

export const updateShowProp = (payload: ShowProps) => changeShowProp.update(payload);

export const changeShowWeb3 = (web3Dialog: boolean) => updateShowProp({web3Dialog});
export const changeShowCreateBounty = (createBounty: boolean) => updateShowProp({createBounty});