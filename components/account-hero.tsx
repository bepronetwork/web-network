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

        const issuesIds = await BeproService.network.getIssuesByAddress(
          account.address,
        );
        const oracles = await BeproService.network.getOraclesSummary({
          address: account.address,
        });

        account.dispatch({
          type: TYPES.SET,
          props: {
            issuesIds,
            oracles,
          },
        });
        setLoadingAttributes(false);
      } catch (error) {
        console.log("AccountHero getData", error);
        setLoadingAttributes(false);
      }
    })();
  }, [account.address]);

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
                    <h4 className="h4 mb-0">{account.issuesIds?.length}</h4>
                    <span className="p-small">Issues</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{account.oracles.tokensLocked}</h4>
                    <span className="p-small">Oracles</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {account.oracles.oraclesDelegatedByOthers}
                    </h4>
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
