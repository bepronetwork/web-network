import {
  createContext,
  Dispatch,
  ReactElement,
  useContext,
  useReducer,
} from "react";

const TYPES = {
  SET: "set",
  RESET: "reset",
} as const;
const initialState = {
  issuesIds: [null as number],
  beproStaked: 0,
  oracles: {
    oraclesDelegatedByOthers: "",
    amounts: [null as string],
    addresses: [null as string],
    tokensLocked: "",
  },
  address: "",
  amount: "",
  isConnected: false,
};

type Type = typeof TYPES;
type State = typeof initialState;
type StateOptional = {
  // todo: catch type by object property and not all of them
  // doesn't work: [key in keyof State]?: State[key in keyof State];
  [key in keyof State]?: State[keyof State];
};
type Action = {
  type: Type[keyof Type];
  props: StateOptional;
};

const Account = {
  State: createContext<State>(initialState),
  Dispatch: createContext<Dispatch<Action>>(() => {}),
};

function init(initialState: StateOptional) {
  return initialState;
}
function reducer(state: State, action: Action) {
  switch (action.type) {
    case TYPES.SET:
      return {
        ...state,
        ...action.props,
      };
    case TYPES.RESET:
      return init(action.props);
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
  return {
    ...useContext(Account.State),
    dispatch: useContext(Account.Dispatch),
  };
}

Account.State.displayName = "AccountState";
Account.Dispatch.displayName = "AccountDispatch";
export { Provider, TYPES };
export default useAccount;
