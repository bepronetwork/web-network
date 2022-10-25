import { useEffect, useState } from "react";

import { ERC20Details } from "components/custom-network/erc20-details";
import TabbedNavigation from "components/tabbed-navigation";

export function NetworkTokenConfig({
  onChange,
  beproTokenAddress
}) {
  const [tokenAddress, setTokenAddress] = useState<string>();

  function handleTokenAddressChange(newAddress) {
    setTokenAddress(newAddress);
    onChange(newAddress);
  }

  const TABS = [
    {
      eventKey: "bepro",
      title: "Use BEPRO token",
      component: ( 
        <ERC20Details
          key="beproToken"
          address={beproTokenAddress}
          readOnly
        />
      )
    },
    {
      eventKey: "custom",
      title: "Use a custom token",
      component: ( 
        <ERC20Details
          key="customToken"
          onChange={handleTokenAddressChange}
          address={tokenAddress}
        />
      )
    },
    {
      eventKey: "deployed",
      title: "Deploy new token",
      component: ( 
        <ERC20Details
          key="deployedToken"
          onChange={handleTokenAddressChange}
          address={tokenAddress}
          deployer
        />
      )
    }
  ];

  function onTransition(newActiveKey: string) {
    onChange(newActiveKey === "bepro" && beproTokenAddress || tokenAddress);
  }

  useEffect(() => {
    if (beproTokenAddress) onChange(beproTokenAddress);
  }, [beproTokenAddress]);

  return(
    <>
      <TabbedNavigation
        className="issue-tabs mt-2"
        defaultActiveKey="bepro"
        tabs={TABS}
        onTransition={onTransition}
      />
    </>
  );
}