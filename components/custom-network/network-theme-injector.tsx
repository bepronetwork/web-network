import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useSettings } from "contexts/settings";

import useNetworkTheme from "x-hooks/use-network-theme";

export default function NetworkThemeInjector() {
  const { pathname } = useRouter();

  const [currentColors, setCurrentColors] = useState("");

  const { settings } = useSettings();
  const { network, colorsToCSS } = useNetworkTheme();

  const ignorePaths = ["/networks", "/new-network"];

  useEffect(() => {
    if (network?.name && 
        network?.name !== settings?.defaultNetworkConfig?.name && 
        !ignorePaths.includes(pathname))
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
