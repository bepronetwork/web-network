import IssueDesktopFilters from "components/issue-filters/desktop-filters";
import IssueMobileFilters from "components/issue-filters/mobile-filters";

export default function IssueFilters({ onlyTimeFrame = false, sortOptions }) {
  return (
    <>
      <div className="d-none d-xl-flex">
        <IssueDesktopFilters onlyTimeFrame={onlyTimeFrame} />
      </div>

      <div className="d-flex d-xl-none">
        <IssueMobileFilters onlyTimeFrame={onlyTimeFrame} sortOptions={sortOptions} />
      </div>
    </>
  );
}
