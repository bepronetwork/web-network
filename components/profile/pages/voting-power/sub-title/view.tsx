
import TokenSymbolView from "components/common/token-symbol/view";
import InfoTooltip from "components/info-tooltip";
import ResponsiveWrapper from "components/responsive-wrapper";

import { formatStringToCurrency } from "helpers/formatNumber";

interface ResponsiveProps {
  xs: boolean;
  md: boolean;
}

export default function VotingPowerSubTitleView({
  label,
  total,
  votesSymbol,
  propsMobile,
  propsDesktopAndTablet,
  infoTooltip,
  getTextColorProps,
  getTitleSpanClass,
  getAmountClass,
}: {
  label: string;
  infoTooltip: string;
  total: string;
  votesSymbol: string;
  propsMobile: ResponsiveProps;
  propsDesktopAndTablet: ResponsiveProps;
  getTextColorProps: () => { className: string } | { style: { color: string } };
  getTitleSpanClass: (type: string) => string;
  getAmountClass: (type: string) => string;
}) {

  function renderAmount({icon = true}) {
    return (
      <>
        <span>
          {formatStringToCurrency(total)}
        </span>

        <TokenSymbolView name={votesSymbol} {...getTextColorProps()} />
        {icon && (
          <InfoTooltip
            description={infoTooltip}
            secondaryIcon
          />
        )}
      </>
    );
  }

  return (
    <>
      <ResponsiveWrapper {...propsMobile}>
        <span className={getTitleSpanClass("fs-small")}>
          {label}
        </span>
      </ResponsiveWrapper>
      <ResponsiveWrapper {...propsDesktopAndTablet}>
        <span className={getTitleSpanClass("h4")}>
          {label}
        </span>
      </ResponsiveWrapper>
      <ResponsiveWrapper
        {...propsMobile}
        className={getAmountClass("fs-smallest")}
      >
        {renderAmount({icon: false})}
      </ResponsiveWrapper>
      <ResponsiveWrapper
        {...propsDesktopAndTablet}
        className={getAmountClass("caption-medium")}
      >
        {renderAmount({})}
      </ResponsiveWrapper>
    </>
  );
}
