import { ERC20Details } from "components/custom-network/erc20-details";
import TabbedNavigation from "components/tabbed-navigation";

export function NetworkTokenConfig({
  onChange,
  beproTokenAddress,
  networkTokenAddress
}) {
  const TABS = [
    {
      eventKey: "bepro",
      title: "Use BEPRO token",
      component: ( 
        <ERC20Details
          address={networkTokenAddress}
          onChange={onChange}
          readOnly
        />
      )
    },
    {
      eventKey: "custom",
      title: "Use a custom token",
      component: ( 
        <ERC20Details
          address={networkTokenAddress}
          onChange={onChange}
        />
      )
    },
    {
      eventKey: "deploy",
      title: "Deploy new token",
      component: ( 
        <ERC20Details
          address={networkTokenAddress}
          onChange={onChange}
        />
      )
    }
  ];

  function onTransition(newActiveKey: string) {
    if (newActiveKey === "bepro")
      onChange(beproTokenAddress);
    else
      onChange("");
  }

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