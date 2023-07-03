import { IssueState } from "interfaces/issue-data";
import { SVGProps } from "react";

export default function CircleIcon({
  props,
  type,
}: {
  props?: SVGProps<SVGSVGElement>;
  type: IssueState;
}) {
  const CIRCLE_FUNDING_COLOR = "#FFD646";
  const CIRCLE_OPEN_COLOR = "#35E0AD";
  const CIRCLE_DRAFT_COLOR = "#D5D6DC";
  
  function getColor() {
    if (["ready", "proposal", "open"].includes(type)) return CIRCLE_OPEN_COLOR;
    else if (["partial-funded", "funding"].includes(type))
      return CIRCLE_FUNDING_COLOR;

    return CIRCLE_DRAFT_COLOR;
  }

  function renderCircle() {
    const isRect = ["ready", "proposal", "partial-funded"].includes(type);
    const isDraft = type === "draft";
    const circleProps = {
      cx: "8",
      cy: "8.5",
      r: isRect ? "2" : "7",
      ...(isRect
        ? { fill: getColor() }
        : {
            stroke: getColor(),
            ...(isDraft ? { strokeDasharray: "3 3" } : { strokeWidth: "2" }),
          }),
    };

    return (
      <>
        <circle {...circleProps} />
        {isRect && (
          <rect
            x="1"
            y="1.5"
            width="14"
            height="14"
            rx="7"
            stroke={getColor()}
            strokeWidth="2"
          />
        )}
      </>
    );
  }

  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {renderCircle()}
    </svg>
  );
}
