import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import PlusIcon from "assets/icons/plus-icon";

import ContractButton from "components/contract-button";
import CustomContainer from "components/custom-container";
import HorizontalScroll from "components/horizontal-scroll/controller";
import If from "components/If";
import IssueListItem from "components/issue-list-item";
import NothingFound from "components/nothing-found";

import { issueParser } from "helpers/issue";

import { IssueData } from "interfaces/issue-data";

interface ListRecentIssuesProps {
  type?: "bounty" | "funding";
  recentBounties: IssueData[];
}

export default function ListRecentIssues({
  type = "bounty",
  recentBounties,
}: ListRecentIssuesProps) {
  const { push } = useRouter();
  const { t } = useTranslation(["bounty"]);

  const isBountyType = type === "bounty";
  const MIN_COLS = 3;

  const LABELS = {
    bounty: {
      title: t("recent-bounties"),
      notFound: t("not-found-bounty"),
      create: t("create-bounty"),
    },
    funding: {
      title: t("recent-funding"),
      notFound: t("not-found-funding"),
      create: t("create-funding"),
    }
  };

  function renderNothingFound() {
    const goToPage = 
      () => isBountyType ? push("/create-bounty") : push("/create-bounty?type=funding", "/create-bounty");

    return (
      <div className="col-12 col-sm-6 col-md">
        <NothingFound
          description={
          <>
            <span className="d-none d-md-flex justify-content-center">
              {LABELS[type].notFound}
            </span>

            <span className="d-flex d-md-none text-truncate">
              {LABELS[type].notFound}
            </span>
          </>
        }
          type="dashed"
        >
          <div className="d-flex justify-content-center">
            <ContractButton
              onClick={goToPage}
              textClass="text-white-50"
              className="read-only-button bg-gray-850 border-gray-850 mt-3 text-nowrap"
            >
              <PlusIcon className="text-gray-400" />
              <span>
                {LABELS[type].create}
              </span>
            </ContractButton>
          </div>
        </NothingFound>
      </div>
    );
  }

  return (
    <CustomContainer className="px-xl-0">
      <div className="d-flex mt-2 p-1">
        <h4 className="mt-1 font-weight-medium">
          {LABELS[type].title}
        </h4>
      </div>

      <div className="row mb-3 mt-1">
        <HorizontalScroll>
          {recentBounties?.map((bounty) => (
              <div className="col-12 col-sm-6 col-md-5 col-lg-4" key={bounty.id}>
                <IssueListItem issue={issueParser(bounty)} key={bounty.id} size="sm" />
              </div>
          ))}
            
          <If condition={recentBounties?.length < MIN_COLS}>
            {renderNothingFound()}
          </If>
        </HorizontalScroll>
      </div>
    </CustomContainer>
  );
}
