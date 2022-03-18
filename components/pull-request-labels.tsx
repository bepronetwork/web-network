import React, { useEffect, useState } from "react";

export type PRLabel =
  | "ready to merge"
  | "broken tests"
  | "conflicts"
  | "merged"
  | "closed";
interface IPRLabel {
  label?: PRLabel;
  className?: string;
  hero?: boolean;
  merged?: boolean;
  isMergeable?: boolean | null;
}

function PullRequestLabels({
  label,
  className,
  merged,
  isMergeable,
  hero = false
}: IPRLabel) {
  const [state, setState] = useState<PRLabel>(label || null);
  function getColorLabel() {
    switch (state?.toLowerCase()) {
      case "ready to merge": {
        return "success";
      }
      case "broken tests": {
        return "warning";
      }
      case "conflicts": {
        return "danger";
      }
      case "closed": {
        return "danger";
      }
      default: {
        return hero ? "white" : "primary";
      }
    }
  }

  function getLabel(): PRLabel {
    if (merged) return "merged";
    if (isMergeable) return "ready to merge";
    //isMergeable can be null;
    return "conflicts";
  }

  useEffect(() => {
    if (!label) {
      setState(getLabel());
    }
  }, [merged, isMergeable]);

  if (!state) return <></>;

  return (
    <div
      className={`pullrequest-labels d-flex justify-content-center align-items-center bg-${getColorLabel()}-30 rounded-pill p-1 ${
        className || ""
      }`}
    >
      <span
        className={`caption-small text-uppercase text-${getColorLabel()} mx-1 text-nowrap`}
      >
        {state}
      </span>
    </div>
  );
}

export default PullRequestLabels;
