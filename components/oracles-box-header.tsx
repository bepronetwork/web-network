import clsx from "clsx";
import {formatNumberToCurrency} from 'helpers/formatNumber'
// This has to be generic.
// todo: create something like <Tabs /> <TabContainer />
function OraclesBoxHeader({
  actions = null,
  available,
  onChange = () => {},
  currentAction = "",
}: {
  actions: string | string[];
  available?: number | undefined;
  onChange?(action: string): void;
  currentAction?: string;
}): JSX.Element {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex">
        {typeof actions === "string" ? (
          <h4 className="h4 mb-0 text-white bg-opacity-100">{actions}</h4>
        ) : (
          actions.map((action: string) => (
            <button
              key={action}
              onClick={() => onChange(action)}
              className={clsx("btn p-0 subnav-item", {
                active: action === currentAction,
              })}>
              <h4 className="h4 mb-0 mr-2">{action}</h4>
            </button>
          ))
        )}
      </div>
      {typeof available !== "undefined" && (
        <span className="badge-opac bg-dark-gray text-white text-opacity-100 smallCaption py-1 px-3">{formatNumberToCurrency(available)} Available</span>
      )}
    </div>
  );
}

export default OraclesBoxHeader;
