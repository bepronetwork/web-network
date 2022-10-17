import {useContext, useEffect, useMemo} from "react";
import {AppStateContext} from "../contexts/app-state";

export function useDao() {
  const {state, dispatch} = useContext(AppStateContext);

  function start() {
    if (state.Settings)
      return;



  }


  function connect() {}
  function changeNetwork() {}

  useEffect(start, [state.Service])

  return useMemo(() => {}, []);
}