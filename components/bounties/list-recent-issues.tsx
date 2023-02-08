import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import CustomContainer from "components/custom-container";
import IssueListItem from "components/issue-list-item";
import NothingFound from "components/nothing-found";

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
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
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
            <div className="col-md-4 col mb-1" key={bounty.id}>
              <IssueListItem issue={bounty} key={bounty.id} size="sm" />
            </div>
          ))}
        {bounties?.length === 0 && <NothingFound description={t("recent-bounties-empty")}/>}
      </div>
    </CustomContainer>
  );
}
