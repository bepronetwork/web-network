import { useTranslation } from "next-i18next";

import ArrowUpRight from "assets/icons/arrow-up-right";
import ChevronRightIcon from "assets/icons/chevronright-icon";

import Button from "components/button";
import CollapseArrows from "components/common/collapse-arrows/view";
import { FlexColumn } from "components/common/flex-box/view";
import ResponsiveWrapper from "components/responsive-wrapper";

import NetworkItemAmountView from "../../amount/view";
interface BodyNetworkViewProps {
  isCollapsed: boolean;
  handleNetworkLink: () => void;
  type: "network" | "voting" | "payments";
  amount: string | number;
  symbol: string;
  isNetworkVariant: boolean;
  primaryColor: string;
  handleToggleCollapse: () => void;
}

export default function BodyNetworkView({
  isCollapsed,
  type,
  amount,
  symbol,
  isNetworkVariant,
  primaryColor,
  handleNetworkLink,
  handleToggleCollapse,
}: BodyNetworkViewProps) {
  const { t } = useTranslation(["profile"]);

  function NetworkLinkIconButton({ className = "" }) {
    return (
      <Button
        className={`${className} cursor-pointer p-1 not-svg border border-gray-700 bg-gray-850 border-radius-4`}
        onClick={handleNetworkLink}
      >
        <ArrowUpRight />
      </Button>
    );
  }

  function RenderAmount() {
    return (
      <NetworkItemAmountView
        type={type}
        amount={amount}
        symbol={symbol}
        isNetworkVariant={isNetworkVariant}
        primaryColor={primaryColor}
      />
    );
  }

  return (
    <>
      <ResponsiveWrapper
        xl={true}
        xs={false}
        className="d-flex align-items-center justify-content-center col-xl-3"
      >
        <RenderAmount />
      </ResponsiveWrapper>
      <ResponsiveWrapper
        xl={true}
        xs={false}
        className="d-flex justify-content-center align-items-center col-xl-3 "
      >
          <NetworkLinkIconButton className="px-1 ms-3" />
      </ResponsiveWrapper>
      <div
        className="col-xl-3 col-6 d-flex justify-content-end cursor-pointer"
        onClick={handleToggleCollapse}
      >
        <FlexColumn className="justify-content-center text-gray-200">
          <ResponsiveWrapper
            xs={false}
            xl={true}
          >
            <CollapseArrows isCollapsed={isCollapsed} />
          </ResponsiveWrapper>

          <ResponsiveWrapper
            xs={true}
            xl={false}
          >
            <ChevronRightIcon width={14} height={14} />
          </ResponsiveWrapper>
        </FlexColumn>
      </div>
      <ResponsiveWrapper
        xl={false}
        xs={true}
        className="d-flex flex-column col-12 justify-content-center mt-3 pb-3"
      >
        <span className="font-weight-normal text-gray-500 text-capitalize mb-2">
          {type === "network" ? t("network-columns.total-votes") : t("network-columns.total-received")}
        </span>
        <RenderAmount />
      </ResponsiveWrapper>
    </>
  );
}
