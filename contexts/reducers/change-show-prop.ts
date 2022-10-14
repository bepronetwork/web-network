import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";


interface ShowProps {
  web3Dialog?: boolean;
  createBounty?: boolean;

  [k: string]: boolean
}

export const ChangeShowProp = new SimpleAction<ShowProps>(AppStateReduceId.Show, 'show');

export const changeShowProp = (payload: ShowProps) => ChangeShowProp.update(payload);

export const changeShowWeb3 = (web3Dialog: boolean) => changeShowProp({web3Dialog});
export const changeShowCreateBounty = (createBounty: boolean) => changeShowProp({createBounty});