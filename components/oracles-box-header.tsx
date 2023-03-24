import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { formatNumberToCurrency } from "helpers/formatNumber";

import Button from "./button";
// This has to be generic.
// todo: create something like <Tabs /> <TabContainer />

interface IOraclesBoxProps{
    actions: string | string[];
    available?: number | undefined;
    onChange?(action: string): void;
    currentAction?: string;
    delegatedBox?: boolean;
}
function OraclesBoxHeader({
  actions = null,
  available,
  onChange,
  currentAction = "",
  delegatedBox = false
}: IOraclesBoxProps) {
  const { t } = useTranslation("my-oracles");

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex">
        {typeof actions === "string" ? (
          <h4 className="h4 mb-0 text-white bg-opacity-100">{actions}</h4>
        ) : (
          actions.map((action: string) => (
            <Button
              key={action}
              transparent
              onClick={() => onChange(action)}
              className={clsx("btn p-0 subnav-item text-capitalize", {
                active: action === currentAction
              })}
            >
              <h4 className={`h4 mb-0 mr-2 ${action === currentAction ? "tex-white" : "text-gray-500"}`}>{action}</h4>
            </Button>
          ))
        )}
      </div>
      {typeof available !== "undefined" && (
        <span className="border-radius-4 bg-dark-gray text-white text-opacity-100 caption-small py-1 px-3">
          {formatNumberToCurrency(available)}{" "}
          {(delegatedBox && t("delegated")) || t("available")}
        </span>
      )}
    </div>
  );
}

export default OraclesBoxHeader;
