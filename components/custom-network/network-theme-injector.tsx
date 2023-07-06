import {useEffect, useState} from "react";

import {useRouter} from "next/router";

import { isOnNetworkPath } from "helpers/network";

import useNetworkTheme from "x-hooks/use-network-theme";

import {useAppState} from "../../contexts/app-state";

export default function NetworkThemeInjector() {
  const { pathname } = useRouter();
  const [currentColors, setCurrentColors] = useState("");
  const {state} = useAppState();

  const { colorsToCSS } = useNetworkTheme();

  const isOnNetwork = isOnNetworkPath(pathname);

  useEffect(() => {
    if (state.Service?.network?.active?.colors && isOnNetwork)
      setCurrentColors(colorsToCSS());
    else
      setCurrentColors("");
  }, [state.Service?.network?.active?.name, pathname]);

  return (
    <>
      <style>{currentColors}</style>
    </>
  );
}
