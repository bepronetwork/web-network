import {useContext, useEffect, useState} from "react";

import { useRouter } from "next/router";

import useNetworkTheme from "x-hooks/use-network-theme";

import {AppStateContext, useAppState} from "../../contexts/app-state";

export default function NetworkThemeInjector() {
  const { pathname } = useRouter();
  const [currentColors, setCurrentColors] = useState("");
  const {state} = useAppState();

  const { colorsToCSS } = useNetworkTheme();

  const ignorePaths = ["/networks", "/new-network"];

  useEffect(() => {
    if (state.Service?.network?.active?.name &&
        state.Service?.network?.active?.name !== state.Settings?.defaultNetworkConfig?.name &&
        !ignorePaths.includes(pathname))
      setCurrentColors(colorsToCSS());
    else
      setCurrentColors("");
  }, [state.Service?.network?.active]);

  return (
    <>
      <style>{currentColors}</style>
    </>
  );
}
