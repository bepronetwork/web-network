import Button, {ButtonProps} from "components/button";

import {useAppState} from "contexts/app-state";
import {changeNeedsToChangeChain} from "contexts/reducers/change-spinners";
import {changeShowWeb3} from "contexts/reducers/update-show-prop";

import {UNSUPPORTED_CHAIN} from "helpers/constants";

export default function ContractButton({ onClick, children, ...rest }: ButtonProps) {
  const { state, dispatch } = useAppState();

  function handleExecute(e) {
    if(!window.ethereum) return dispatch(changeShowWeb3(true));

    if (state.connectedChain?.matchWithNetworkChain === false || state.connectedChain?.name === UNSUPPORTED_CHAIN)
      dispatch(changeNeedsToChangeChain(true));
    else
      onClick?.(e);
  }

  return(
    <Button
      onClick={handleExecute}
      {...rest}
    >
      {children}
    </Button>
  );
}