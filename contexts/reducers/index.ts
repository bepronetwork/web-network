import {changeChain} from "./change-chain";
import {changeCurrentBounty, changeCurrentBountyDataChain} from "./change-current-bounty";
import {changeCurrentUser} from "./change-current-user";
import {changeLoad} from "./change-load";
import {changeNetwork, changeRepos, changeServiceProp} from "./change-service";
import {changeSettings,} from "./change-settings";
import {changeSpinners} from "./change-spinners";
import {changeToaster} from "./change-toaster";
import {changeTxList} from "./change-tx-list";
import {Actions, addReducer} from "./main";
import {changeShowProp} from "./update-show-prop";

let loaded = false;

export default function loadApplicationStateReducers() {
  if (loaded)
    return;

  [
    changeLoad,
    changeCurrentUser,
    changeChain,
    changeTxList,
    changeToaster,
    changeShowProp,
    changeServiceProp,
    changeNetwork,
    changeRepos,
    changeCurrentBounty,
    changeCurrentBountyDataChain,
    changeSpinners,
    changeSettings,
  ].forEach(addReducer);

  console.debug(`Loaded State Reducers`);
  console.table(Actions
      .map(({id, stateKey}) => ({id, stateKey}))
      .reduce((p, c) => ({...p, [c.id]: c.stateKey}), {}));

  loaded = true;
}
