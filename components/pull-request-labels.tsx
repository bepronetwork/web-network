import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

export type PRLabel =
  | "ready to merge"
  | "broken tests"
  | "conflicts"
  | "merged"
  | "closed"
  | "draft";
interface IPRLabel {
  label?: PRLabel;
  className?: string;
  hero?: boolean;
  merged?: boolean;
  needsApproval?: boolean;
  isDraft?: boolean;
  isMergeable?: boolean | null;
}

function PullRequestLabels({
  label,
  className,
  merged,
  isMergeable,
  needsApproval = false,
  isDraft = false,
  hero = false
}: IPRLabel) {
  const { t } = useTranslation("pull-request");

  const [state, setState] = useState<PRLabel>(label || null);

  function getColorLabel() {
    switch (state?.toLowerCase()) {
    case t("status.ready-to-merge").toLowerCase(): {
      return "success";
    }
    case t("status.broken-tests").toLowerCase(): {
      return "warning";
    }
    case t("status.conflicts").toLowerCase(): {
      return "danger";
    }
    case t("status.closed").toLowerCase(): {
      return "danger";
    }
    default: {
      return hero || isDraft ? "white" : "primary";
    }
    }
  }

  function getLabel(): PRLabel {
    if (isDraft) return t("status.draft");
    if (merged) return t("status.merged");
    if (isMergeable) return t("status.ready-to-merge");
    if (needsApproval) return t("status.needs-approval");
    
    return t("status.conflicts");
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
