import {createContext, Dispatch, useContext, useReducer} from 'react';
import {mainReducer} from './reducers/main';
import {ApplicationState} from '../interfaces/application-state';
import {ReduceActor} from '../interfaces/reduce-action';
import LoadApplicationReducers from './reducers';

interface GlobalState {
  state: ApplicationState,
  dispatch: (action: ReduceActor<any>) => Dispatch<ReduceActor<any>>,
}

const defaultState = {
  state: {
    githubHandle: ``,
    metaMaskWallet: false,
  },
  dispatch: () => undefined
};

export const ApplicationContext = createContext<GlobalState>(defaultState)

export default function ApplicationContextProvider({children}) {
  const [state, dispatch] = useReducer(mainReducer, defaultState.state);

  LoadApplicationReducers();

  return <ApplicationContext.Provider value={{state, dispatch: dispatch as any}}>{children}</ApplicationContext.Provider>
}
