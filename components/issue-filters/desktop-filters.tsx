import { useEffect, useRef, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import FilterIcon from "assets/icons/filter-icon";

import Button from "components/button";
import CounterBadge from "components/counter-badge";
import IssueFilterBox from "components/issue-filter-box";
import Translation from "components/translation";

import useFilters from "x-hooks/use-filters";

export default function IssueDesktopFilters({ onlyTimeFrame = false }) {
  const node = useRef();
  const [show, setShow] = useState(false);
  const [
    [, stateOptions, timeOptions],
    updateOptions,
    clearFilters,
  ] = useFilters();
  const { query } = useRouter();
  const { state, time } = query;
  const { t } = useTranslation("common");

  function countFilters() {
    return +!!state + +!!time;
  }

  function countFiltersLabel() {
    const quantity = countFilters();

    if (quantity > 0) return <CounterBadge value={quantity} className="mr-1" />;

    return <FilterIcon />;
  }

  function handleClick(e) {
    // @ts-ignore
    if (node.current.contains(e.target)) return;

    setShow(false);
  }

  function loadOutsideClick() {
    if (show) document.addEventListener("mousedown", handleClick);
    else document.removeEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }

  function handleClearFilters() {
    clearFilters();
  }

  function FilterTimeFrame() {
    return (
      <IssueFilterBox
        title={t("filters.timeframe.title")}
        options={timeOptions}
        onChange={(opt, checked) =>
          updateOptions(timeOptions, opt, checked, "time")
        }
      />
    );
  }

  useEffect(loadOutsideClick, [show]);

  return (
    <div className="position-relative d-flex justify-content-end" ref={node}>
      {countFilters() > 0 && (
        <Button
          transparent
          applyTextColor
          textClass="text-primary"
          className="p-0 mr-2"
          onClick={handleClearFilters}
        >
          <Translation label="misc.clear" />
        </Button>
      )}

      <Button
        color="gray-900"
        className={`${(show && "border-primary") || ""} rounded-2 m-0`}
        onClick={() => setShow(!show)}
      >
        {countFiltersLabel()}{" "}
        <span>
          <Translation label="filters.filters" />
        </span>
      </Button>

      <div
        className={`border border-gray-800 rounded rounded-3 filter-wrapper d-${
          show ? "flex" : "none"
        } justify-content-start align-items-stretch position-absolute`}
      >
        {onlyTimeFrame ? (
          <FilterTimeFrame />
        ) : (
          <div className="bg-gray-900">
            <IssueFilterBox
              title={t("filters.bounties.title")}
              options={stateOptions}
              onChange={(opt, checked) =>
                updateOptions(stateOptions, opt, checked, "state")
              }
            />
            <FilterTimeFrame />
          </div>
        )}
      </div>
    </div>
  );
}
