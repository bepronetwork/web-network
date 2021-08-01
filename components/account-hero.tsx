import useAccount, { TYPES } from "hooks/useAccount";
import { setLoadingAttributes } from "providers/loading-provider";
import { useEffect } from "react";
import BeproService from "services/bepro";

export default function AccountHero() {
  const account = useAccount();

  useEffect(() => {
    (async function getData() {
      try {
        setLoadingAttributes(true);
        await BeproService.login();

        const address = await BeproService.getAddress();
        const issues = await BeproService.network.getIssuesByAddress(address);
        const summary = await BeproService.network.getOraclesSummary({
          address,
        });

        account.dispatch({
          type: TYPES.SET,
          props: {
            oracles: summary?.tokensLocked ?? "0",
            issues,
            delegated: summary?.oraclesDelegatedByOthers ?? "0",
          },
        });
        setLoadingAttributes(false);
      } catch (error) {
        console.log("AccountHero getData", error);
        setLoadingAttributes(false);
      }
    })();
  }, []);

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h1 className="h1 mb-0">My account</h1>
              <div className="row">
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{account.issues?.length}</h4>
                    <span className="p-small">Issues</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{account.oracles}</h4>
                    <span className="p-small">Oracles</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{account.delegated}</h4>
                    <span className="p-small">Delegated oracles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
