import { useEffect, useState } from "react";

import getConfig from "next/config";
import { useRouter } from "next/router";

import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig: { networkConfig: { networkName } } } = getConfig();

export default function NetworkThemeInjector() {
  const { pathname } = useRouter();

  const [currentColors, setCurrentColors] = useState("");

  const { network, colorsToCSS } = useNetworkTheme();

  const ignorePaths = ["/networks", "/new-network"];

  useEffect(() => {
    if (network?.name && network?.name !== networkName && !ignorePaths.includes(pathname))
      setCurrentColors(colorsToCSS());
    else
      setCurrentColors("");
  }, [network]);

  return (
    <>
      <style>{currentColors}</style>
    </>
  );
}
