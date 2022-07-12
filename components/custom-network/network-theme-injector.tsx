import { useEffect, useState } from "react";

import getConfig from "next/config";

import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig: { networkConfig: { networkName } } } = getConfig();

export default function NetworkThemeInjector() {
  const [currentColors, setCurrentColors] = useState("");

  const { network, colorsToCSS } = useNetworkTheme();

  useEffect(() => {
    if (network?.name && network?.name !== networkName)
      setCurrentColors(colorsToCSS());
  }, [network]);

  return (
    <>
      <style>{currentColors}</style>
    </>
  );
}
