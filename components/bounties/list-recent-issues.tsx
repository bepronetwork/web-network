import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LoadingList from "components/bounties/loading-list";
import CustomContainer from "components/custom-container";
import IssueListItem from "components/issue-list-item";
import NothingFound from "components/nothing-found";

import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

export default function ListRecentIssues() {
  const { t } = useTranslation(["bounty"]);

  const [loading, setLoading] = useState<boolean>(false);
  const [bounties, setBounties] = useState<IssueBigNumberData[]>();
  
  const { networkName } = useNetwork();
  const { searchRecentIssues } = useApi();

  useEffect(() => {
    setLoading(true);
    searchRecentIssues({ networkName })
      .then(setBounties)
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
      .finally(() => setLoading(false));
  }, [networkName]);

  return (
    <CustomContainer>
      <div className="d-flex mt-2 p-1">
        <h4 className="mt-1">{t("recent-bounties")}</h4>
      </div>
      
      <LoadingList loading={loading} />
      <div className="row gy-3">
        {bounties &&
          bounties?.map((bounty) => (
            <div className="col-md-4 col" key={bounty.id}>
              <IssueListItem issue={bounty} key={bounty.id} size="sm" />
            </div>
          ))}
        {bounties?.length === 0 && <NothingFound description={t("recent-bounties-empty")}/>}
      </div>
    </CustomContainer>
  );
}
