import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import CustomContainer from "components/custom-container";
import IssueListItem from "components/issue-list-item";

import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";

import LoadingList from "./loading-list";

export default function ListRecentIssues() {
  const { t } = useTranslation(["bounty"]);
  const [bounties, setBounties] = useState<IssueBigNumberData[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const { searchRecentIssues } = useApi();

  useEffect(() => {
    setLoading(true);
    searchRecentIssues({})
      .then(setBounties)
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomContainer className="mb-3">
      <div className="d-flex mt-2 p-1">
        <h4 className="mt-1">{t("recent-bounties")}</h4>
      </div>
      <LoadingList loading={loading} />
      <div className="row mt-3">
        {bounties &&
          bounties?.map((bounty) => (
            <div className="col mb-1" key={bounty.id}>
              <IssueListItem issue={bounty} key={bounty.id} size="sm" />
            </div>
          ))}
      </div>
    </CustomContainer>
  );
}
