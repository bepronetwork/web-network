import { setLoadingAttributes } from "providers/loading-provider";
import {
  createContext,
  Dispatch,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import BeproService from "services/bepro";

const TYPES = {
  SET: "set",
  RESET: "reset",
} as const;
const initialState = {
  issues: [],
  bepros: "",
  oracles: "",
  delegated: 0,
  address: "",
  amount: "",
  isConnected: false,
};

type State = typeof initialState;
type Action = {
  type: typeof TYPES[keyof typeof TYPES];
  props: {
    [key: string]: string | number | any;
  };
};

const Account = {
  State: createContext<State>(initialState),
  Dispatch: createContext<Dispatch<Action>>(() => {}),
};

function init(initialState: State) {
  return { ...initialState };
}
function reducer(state: State, action: Action) {
  switch (action.type) {
    case TYPES.SET:
      return {
        ...state,
        ...action.props,
      };
    case TYPES.RESET:
      return init(initialState);
    default:
      throw new Error("Action not allowed.");
  }
}
function Provider({ children }: { children: ReactElement }) {
  const [state, dispatch] = useReducer(reducer, initialState, init);

  return (
    <Account.State.Provider value={state}>
      <Account.Dispatch.Provider value={dispatch}>
        {children}
      </Account.Dispatch.Provider>
    </Account.State.Provider>
  );
}
function useAccount() {
  const dispatch = useContext(Account.Dispatch);
  const connect = useCallback(async () => {
    try {
      setLoadingAttributes(true);
      await BeproService.login();
      dispatch({
        type: TYPES.SET,
        props: {
          isConnected: true,
        },
      });

      const address = await BeproService.getAddress();
      const bepros = await BeproService.network.getBEPROStaked();
      const oracles = await BeproService.network.getOraclesByAddress({
        address,
      });
      const issues = await BeproService.network.getIssuesByAddress(address);

      dispatch({
        type: TYPES.SET,
        props: {
          address,
          bepros,
          oracles,
          issues,
        },
      });
      setLoadingAttributes(false);
    } catch (error) {
      console.log("useAccount connect", error);
      setLoadingAttributes(false);
    }
  }, []);

  useEffect(() => {
    connect();
  }, []);

  return {
    ...useContext(Account.State),
    actions: {
      dispatch,
      connect,
    },
  };
}

Account.State.displayName = "AccountState";
Account.Dispatch.displayName = "AccountDispatch";
export { Provider, TYPES };
export default useAccount;
