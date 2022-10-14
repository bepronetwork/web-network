import { addReducer } from "./main";
import {changeSettings,} from "./change-settings";
import {changeChain} from "./change-chain";
import {changeTxList} from "./change-tx-list";
import {changeToaster} from "./change-toaster";
import {changeShowProp} from "./update-show-prop";

export default function loadApplicationStateReducers() {
  [
    changeSettings,
    changeChain,
    changeTxList,
    changeToaster,
    changeShowProp,
  ].forEach(addReducer);
}
