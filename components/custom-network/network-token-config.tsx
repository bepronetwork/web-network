import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { ERC20Details } from "components/custom-network/erc20-details";
import TabbedNavigation from "components/tabbed-navigation";

export function NetworkTokenConfig({
  onChange,
  registryToken,
  settlerToken
}) {
  const { t } = useTranslation("custom-network");

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
      title: t("steps.token-configuration.tabs.use-registry-token", { symbol: registryToken?.symbol }),
      component: ( 
        <ERC20Details
          key="beproToken"
          address={registryToken?.address}
          readOnly
        />
      )
    },
    {
      eventKey: "custom",
      title: t("steps.token-configuration.tabs.use-custom-token"),
      component: ( 
        <ERC20Details
          key="customToken"
          onChange={handleCustomTokenAddressChange}
          adressPlaceholder={t("custom-network:steps.token-configuration.fields.address.placeholder")}
          address={customTokenAddress}
        />
      )
    },
    {
      eventKey: "deployed",
      title: t("steps.token-configuration.tabs.deploy-new-token"),
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
      "bepro": registryToken?.address,
      "custom": customTokenAddress,
      "deployed": deployedTokenAddress
    };
    
    onChange(addressesByTab[newActiveKey]);
  }

  useEffect(() => {
    if (registryToken?.address && !settlerToken) onChange(registryToken?.address);
  }, [registryToken?.address, settlerToken]);

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