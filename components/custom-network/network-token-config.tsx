import { useEffect, useState } from "react";

import { ERC20Details } from "components/custom-network/erc20-details";
import TabbedNavigation from "components/tabbed-navigation";

export function NetworkTokenConfig({
  onChange,
  beproTokenAddress
}) {
  const [customTokenAddress, setCustomTokenAddress] = useState<string>();
  const [deployedTokenAddress, setDeployedTokenAddress] = useState<string>();

  function handleCustomTokenAddressChange(newAddress) {
    setCustomTokenAddress(newAddress);
    onChange(newAddress);
  }

  function handleDeployedTokenAddressChange(newAddress) {
    setDeployedTokenAddress(newAddress);
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
          onChange={handleCustomTokenAddressChange}
          address={customTokenAddress}
        />
      )
    },
    {
      eventKey: "deployed",
      title: "Deploy new token",
      component: ( 
        <ERC20Details
          key="deployedToken"
          onChange={handleDeployedTokenAddressChange}
          address={deployedTokenAddress}
          deployer
        />
      )
    }
  ];

  function onTransition(newActiveKey: string) {
    const addressesByTab = {
      "bepro": beproTokenAddress,
      "custom": customTokenAddress,
      "deployed": deployedTokenAddress
    };
    
    onChange(addressesByTab[newActiveKey]);
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