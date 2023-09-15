import React from "react";

import { PRLabel } from "./controller";

export interface PRLabelView {
    state: PRLabel;
    className?: string;
    colorLabel: "success" | "primary" | "danger" | "info" | "orange-500" | "white";
}

export default function PullRequestLabelsView({
    state,
    className,
    colorLabel
}: PRLabelView) {

  return (
    <div className={className}>
      <span
        className={`caption-small text-uppercase text-${colorLabel} mx-1 text-nowrap`}
      >
        {state}
      </span>
    </div>
  );
}