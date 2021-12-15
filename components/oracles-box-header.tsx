import clsx from "clsx";
import {formatNumberToCurrency} from 'helpers/formatNumber'
import { useTranslation } from "next-i18next";
import Button from "./button";
// This has to be generic.
// todo: create something like <Tabs /> <TabContainer />
function OraclesBoxHeader({
  actions = null,
  available,
  onChange = () => {},
  currentAction = "",
  delegatedBox = false,
}: {
  actions: string | string[];
  available?: number | undefined;
  onChange?(action: string): void;
  currentAction?: string;
  delegatedBox?: boolean;
}): JSX.Element {
  const { t } = useTranslation('my-oracles')

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
                active: action === currentAction,
              })}>
              <h4 className="h4 mb-0 mr-2">{action}</h4>
            </Button>
          ))
        )}
      </div>
      {typeof available !== "undefined" && (
        <span className="border-radius-4 bg-dark-gray text-white text-opacity-100 caption-small py-1 px-3">{formatNumberToCurrency(available)} {delegatedBox && t('delegated') || t('available')}</span>
      )}
    </div>
  );
}

export default OraclesBoxHeader;
