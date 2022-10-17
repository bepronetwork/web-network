import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";


interface ShowProps {
  web3Dialog?: boolean;
  createBounty?: boolean;
  failedLoadSettings?: boolean;

  // [k: string]: boolean
}

export const changeShowProp = new SimpleAction<ShowProps>(AppStateReduceId.Show, 'show');

export const updateShowProp = (payload: ShowProps) => changeShowProp.update(payload);

/** @DevNote
 * using these functions will make it so that we can only show one modal at-a-time;
 *
 * to be able to use compounding show props you will need to extend SimpleAction to use destruction
 * as it is shown in change-service.ts */
export const changeShowWeb3 = (web3Dialog: boolean) => updateShowProp({web3Dialog});
export const changeShowCreateBounty = (createBounty: boolean) => updateShowProp({createBounty});