import {changeChain} from "contexts/reducers/change-chain";
import {changeCurrentBounty} from "contexts/reducers/change-current-bounty";
import {changeCurrentUser} from "contexts/reducers/change-current-user";
import {changeLoad} from "contexts/reducers/change-load";
import {changeNetwork, changeServiceProp} from "contexts/reducers/change-service";
import {changeSettings,} from "contexts/reducers/change-settings";
import {changeSpinners} from "contexts/reducers/change-spinners";
import {changeSupportedChains} from "contexts/reducers/change-supported-chains";
import {changeToaster} from "contexts/reducers/change-toaster";
import {changeTxList} from "contexts/reducers/change-tx-list";
import {Actions, addReducer} from "contexts/reducers/main";
import {changeShowProp} from "contexts/reducers/update-show-prop";

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
    changeCurrentBounty,
    changeSpinners,
    changeSettings,
    changeSupportedChains
  ].forEach(addReducer);

  console.debug(`Loaded State Reducers`);
  console.table(Actions
      .map(({id, stateKey}) => ({id, stateKey}))
      .reduce((p, c) => ({...p, [c.id]: c.stateKey}), {}));

  loaded = true;
}
