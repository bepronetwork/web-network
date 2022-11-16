import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

export type PRLabel =
  | "ready to merge"
  | "broken tests"
  | "conflicts"
  | "merged"
  | "closed"
  | "draft"
  | "accepted"
  | "disputed";
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
      return "info";
    }
    case t("status.broken-tests").toLowerCase(): {
      return "orange-500";
    }
    case t("status.conflicts").toLowerCase(): {
      return "danger";
    }
    case t("status.closed").toLowerCase(): {
      return "danger";
    }
    case t("status.disputed").toLowerCase(): {
      return "danger";
    }
    case t("status.merged").toLowerCase(): {
      return "success";
    }
    case t("status.accepted").toLowerCase(): {
      return "success";
    }
    default: {
      return hero || isDraft ? "white" : "primary";
    }
    }
  }

  function getLabel(): PRLabel {
    if(label) return label
    if (isDraft) return t("status.draft");
    if (merged) return t("status.merged");
    if (isMergeable) return t("status.ready-to-merge");
    if (needsApproval) return t("status.needs-approval");
    
    return t("status.conflicts");
  }

  function getPullRequestLabelClass(): string {
    return [
      `pullrequest-labels d-flex justify-content-center`,
      `align-items-center rounded-pill p-1`,
      `bg-${getColorLabel()}-30`,
      className || "",
    ].join(' ');
  }

  useEffect(() => {
    setState(getLabel());
  }, [merged, isMergeable, label]);

  if (!state) return <></>;

  return (
    <div className={getPullRequestLabelClass()}>
      <span
        className={`caption-small text-uppercase text-${getColorLabel()} mx-1 text-nowrap`}
      >
        {state}
      </span>
    </div>
  );
}

export default PullRequestLabels;
