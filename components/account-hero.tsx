import { useEffect, useState } from "react";
import GithubMicroService from "services/github-microservice";
import BeproService from "services/bepro";
import useAccount from "hooks/useAccount";

export default function AccountHero() {
  const { account } = useAccount();
  const [issues, setIssues] = useState<number>(0);

  useEffect(() => {
    (async function getData() {
      try {
        await BeproService.login();

        const issueIds = await BeproService.network.getIssuesByAddress(
          account.address,
        );

        if (issueIds.map((index: number) => index + 1).length) {
          const issues = await GithubMicroService.getIssues(issueIds);

          setIssues(issues);
        }
      } catch (error) {
        console.log("AccountHero getData()", error);
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
                    <h4 className="h4 mb-0">{issues}</h4>
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
                    <h4 className="h4 mb-0">0</h4>
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
