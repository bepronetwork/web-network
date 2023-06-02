import { ReactNode, useState } from "react";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";
import ArrowUpRight from "assets/icons/arrow-up-right";

import Button from "components/button";
import TokenSymbolView from "components/common/token-symbol/view";
import NetworkLogo from "components/network-logo";

import { useAppState } from "contexts/app-state";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { FlexColumn, FlexRow } from "./wallet-balance";

export default function NetworkItem({
  key,
  children,
  type,
  amount,
  symbol,
  handleNetworkLink,
  iconNetwork,
  networkName,
  subNetworkText,
  primaryColor,
  variant = "network"
}: {
  children?: ReactNode;
  key?: number | string;
  type?: "network" | "voting";
  networkName: string;
  subNetworkText?: string;
  primaryColor?: string;
  iconNetwork: string | ReactNode;
  amount: string | number;
  symbol: string;
  handleNetworkLink?: () => void;
  variant?: "network" | "multi-network";
}) {
  const { t } = useTranslation(["profile"]);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const {
    state: { Settings: settings }
  } = useAppState();

  const isNetworkVariant = variant === "network";
  const isNetworkType = type === "network";

  function ArrowComponent() {
    if (isCollapsed) return <ArrowDown width={10} height={8} />;

    return <ArrowUp width={10} height={8} />;
  }

  function renderAmount() {
    return (
      <FlexRow className={`${type === "voting" && "caption-medium"}  mt-2`}>
        <span className="text-white mr-1">
          {formatNumberToCurrency(amount)}
        </span>
        <TokenSymbolView
          name={symbol}
          className={`${isNetworkVariant ? "text-primary" : ""} text-uppercase`}
          style={{ color: primaryColor }}
        />
      </FlexRow>
    );
  }

  function toggleCollapse() {
    setIsCollapsed(previous => !previous);
  }

  function renderType() {
    return (
      <>
        <FlexRow className={`${!isNetworkType && "justify-content-between"}`}>
          <FlexRow className={`${isNetworkType && "col-3"}`}>
            <FlexColumn className="justify-content-center me-2">
            { typeof iconNetwork === "string" ? <NetworkLogo
                src={`${settings?.urls?.ipfs}/${iconNetwork}`}
                alt={`${networkName} logo`}
                isBepro={networkName?.toLowerCase() === "bepro"}
                size="md"
              /> : iconNetwork }
            </FlexColumn>
            <FlexColumn className="justify-content-center">
              <FlexRow>{networkName}</FlexRow>

              {subNetworkText && (
                <FlexRow>
                  <span className="text-gray">{subNetworkText}</span>
                </FlexRow>
              )}
            </FlexColumn>
          </FlexRow>
          {isNetworkType ? (
            <>
              <FlexRow className="col-3 justify-content-center">
                {renderAmount()}
              </FlexRow>
              <FlexRow className="col-3 justify-content-center">
                <FlexColumn className="justify-content-center">
                  <div
                    className="px-1 py-0 mt-1 ms-4 cursor-pointer border border-gray-700 bg-gray-850 border-radius-4"
                    onClick={handleNetworkLink}
                  >
                    <ArrowUpRight />
                  </div>
                </FlexColumn>
              </FlexRow>
              <div
                className="col-3 d-flex justify-content-end cursor-pointer"
                onClick={toggleCollapse}
              >
                <FlexColumn className="justify-content-center mt-1">
                  <ArrowComponent />
                </FlexColumn>
              </div>
            </>
          ) : (
            <FlexColumn className="justify-content-center">
              <FlexRow>
                {renderAmount()}
                {handleNetworkLink && (
                  <Button className="button-gray-850 ms-3 cursor-pointer" onClick={handleNetworkLink}>
                    <span>{t("go-to-network")}</span>{" "}
                    <ArrowUpRight className="w-9-p h-9-p" />
                  </Button>
                )}
              </FlexRow>
            </FlexColumn>
          )}
        </FlexRow>

        {(children && !isCollapsed) && <FlexRow className="mt-3">{children}</FlexRow>}
      </>
    );
  }

  return (
    <div
      className={
        `bg-gray-${ !isNetworkVariant && isNetworkType ? "900" : "950"} p-3 border border-gray-800 border-radius-4 my-2`
      }
      key={key}
    >
      {renderType()}
    </div>
  );
}
