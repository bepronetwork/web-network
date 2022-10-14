import { addReducer } from "./main";
import {changeSettings,} from "./change-settings";
import {changeChain} from "./change-chain";
import {changeTxList} from "./change-tx-list";

export default function loadApplicationStateReducers() {
  [
    changeSettings,
    changeChain,
    changeTxList,
  ].forEach(addReducer);
}
