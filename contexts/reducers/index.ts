import {changeChain} from "./change-chain";
import {changeCurrentBounty} from "./change-current-bounty";
import {changeCurrentUser} from "./change-current-user";
import {changeLoad} from "./change-load";
import {changeNetwork, changeRepos, changeServiceProp} from "./change-service";
import {changeSettings,} from "./change-settings";
import {changeSpinners} from "./change-spinners";
import {changeToaster} from "./change-toaster";
import {changeTxList} from "./change-tx-list";
import {Actions, addReducer} from "./main";
import {changeShowProp} from "./update-show-prop";

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
    changeCurrentUser,
    changeCurrentBounty,
    changeSpinners
  ].forEach(addReducer);

  console.debug(`Loaded State Reducers`);
  console.table(Actions
      .map(({id, stateKey}) => ({id, stateKey}))
      .reduce((p, c) => ({...p, [c.id]: c.stateKey}), {}));
}
