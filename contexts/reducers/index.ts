import {Actions, addReducer} from "./main";
import {changeSettings,} from "./change-settings";
import {changeChain} from "./change-chain";
import {changeTxList} from "./change-tx-list";
import {changeToaster} from "./change-toaster";
import {changeShowProp} from "./update-show-prop";
import {changeNetwork, changeRepos, changeServiceProp} from "./change-service";
import {changeLoad} from "./change-load";
import {changeCurrentUser} from "./change-current-user";

export default function loadApplicationStateReducers() {
  [
    changeLoad,
    changeSettings,
    changeChain,
    changeTxList,
    changeToaster,
    changeShowProp,
    changeServiceProp,
    changeNetwork,
    changeRepos,
    changeCurrentUser
  ].forEach(addReducer);

  console.debug(`Loaded State Reducers`);
  console.table(
    Actions
      .map(({id, stateKey}) => ({id, stateKey}))
      .reduce((p, c) => ({...p, [c.id]: c.stateKey}), {})
  );
}
