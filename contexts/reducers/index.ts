import { addReducer } from "./main";
import {changeSettings,} from "./change-settings";
import {changeChain} from "./change-chain";
import {addTx, changeTxList, removeTx} from "./change-tx-list";

export default function loadApplicationStateReducers() {
  [
    changeSettings,
    changeChain,
    changeTxList,
    addTx,
    removeTx,
  ].forEach(addReducer);
}
