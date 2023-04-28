import { useEffect, useReducer } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import PlusIcon from "assets/icons/plus-icon";

import LoadingList from "components/bounties/loading-list";
import ContractButton from "components/contract-button";
import CustomContainer from "components/custom-container";
import IssueListItem from "components/issue-list-item";
import NothingFound from "components/nothing-found";

import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

interface BountiesStates {
  openBounties?: IssueBigNumberData[];
  loadingOpenBounties?: boolean;
  fundingBounties?: IssueBigNumberData[];
  loadingFundingBounties?: boolean;
}

export default function ListRecentIssues() {
  const { t } = useTranslation(["bounty"]);
  const { push } = useRouter();

  const [bounties, updateBounties] = useReducer((prev: BountiesStates, next: Partial<BountiesStates>) => {
    return { ...prev, ...next };
  },
                                                {
      openBounties: [],
      loadingOpenBounties: false,
      loadingFundingBounties: false,
      fundingBounties: [],
                                                });

  const { networkName } = useNetwork();
  const { searchRecentIssues } = useApi();

  function numberOfColumns(numberBounties: number) {
    if (numberBounties === 1) return 8;
    if (numberBounties === 2) return 4;

    return 12;
  }

  async function handleSearchRecentIssues(type: "open" | "funding") {
    const isOpen = type === "open";
    const setLoading = (state: boolean) =>
      updateBounties(isOpen
          ? { loadingOpenBounties: state }
          : { loadingFundingBounties: state });
    const setBounties = (data: IssueBigNumberData[]) =>
      updateBounties(isOpen ? { openBounties: data } : { fundingBounties: data });

    setLoading(true);
    searchRecentIssues({ networkName, state: type })
      .then(setBounties)
      .catch((err) => {
        console.debug(err);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    handleSearchRecentIssues("open");
    handleSearchRecentIssues("funding");
  }, [networkName]);

  function renderNothingFound(type: "open" | "funding") {
    const isOpen = type === "open";
    const lenBounties = isOpen
      ? bounties.openBounties?.length
      : bounties.fundingBounties?.length || 0;

    const goToPage = 
      () => type === "open" ? push("/create-bounty") : push("/create-bounty?type=funding", "/create-bounty", )

    return (
      <div className={`col-md-${numberOfColumns(lenBounties)}`}>
        <NothingFound
          description={isOpen ? t("not-found-bounty") : t("not-found-funding")}
          type="dashed"
        >
          <div className="d-flex justify-content-center">
            <ContractButton
              onClick={goToPage}
              textClass="text-white-50"
              className="read-only-button bg-gray-850 border-gray-850 mt-3"
            >
              <PlusIcon className="text-gray-400" />
              <span>{isOpen ? t("create-bounty") : t("create-funding")}</span>
            </ContractButton>
          </div>
        </NothingFound>
      </div>
    );
  }

  function renderBounties(type: "open" | "funding") {
    const isOpen = type === "open";

    const currentBounties = isOpen
      ? bounties.openBounties
      : bounties.fundingBounties;
    const loadingState = isOpen
      ? bounties.loadingOpenBounties
      : bounties.loadingFundingBounties;

    return (
      <CustomContainer>
        <div className="d-flex mt-2 p-1">
          <h4 className="mt-1">
            {isOpen ? t("recent-bounties") : t("recent-funding")}
          </h4>
        </div>

        <LoadingList loading={loadingState} />
        <div className="row gy-3 mb-3 mt-1">
          {currentBounties &&
            currentBounties?.map((bounty) => (
              <div className="col-md-4 col" key={bounty.id}>
                <IssueListItem issue={bounty} key={bounty.id} size="sm" />
              </div>
            ))}
          {currentBounties?.length < 3 &&
            !loadingState &&
            renderNothingFound(isOpen ? "open" : "funding")}
        </div>
      </CustomContainer>
    );
  }

  return (
    <>
      {renderBounties("open")}
      {renderBounties("funding")}
    </>
  );
}
