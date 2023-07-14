import clsx from "clsx";

import TotalVotesTitleView from "./view";

export default function VotingPowerSubTitle({
  label,
  infoTooltip,
  total,
  votesSymbol,
  variant,
  tokenColor,
}: {
  label: string;
  infoTooltip: string;
  total: string;
  votesSymbol: string;
  variant: "network" | "multi-network";
  tokenColor: string;
}) {
  const getTitleSpanClass = (type: string) =>
    `family-Regular text-white font-weight-500 me-2 ${type}`;
  const getAmountClass = (type: string) =>
    clsx([
      `d-flex flex-row justify-content-center align-items-center gap-2 ${type}`,
      "text-white py-2 px-3 border-radius-4 border border-gray-800 font-weight-medium",
      variant === "network" ? "bg-gray-900" : "bg-gray-950",
    ]);
  const responsiveMobile = { xs: true, md: false };
  const responsiveDesktopAndTablet = {
    xs: false, md: true
  };

  function getTextColorProps() {
    if (tokenColor)
      return {
        style: {
          color: tokenColor,
        },
      };

    return {
      className: "text-primary",
    };
  }

  return (
    <TotalVotesTitleView
      label={label}
      infoTooltip={infoTooltip}
      total={total}
      votesSymbol={votesSymbol}
      propsMobile={responsiveMobile}
      propsDesktopAndTablet={responsiveDesktopAndTablet}
      getTextColorProps={getTextColorProps}
      getTitleSpanClass={getTitleSpanClass}
      getAmountClass={getAmountClass}
    />
  );
}
