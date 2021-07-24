import clsx from "clsx";

function OraclesBoxHeader({
  actions = null,
  oracles = 0,
  onChange = (action = "") => {},
  currentAction = "",
}: {
  actions: string | string[];
  oracles: number;
  onChange: (action: string) => void;
  currentAction?: string;
}): JSX.Element {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex">
        {typeof actions === "string"
          ? actions
          : actions.map((action) => (
              <button
                key={action}
                onClick={() => onChange(action)}
                className={clsx("btn p-0 subnav-item", {
                  active: action === currentAction,
                })}>
                <h4 className="h4 mb-0 mr-2">{action}</h4>
              </button>
            ))}
      </div>
      <span className="badge-opac">{oracles} Available</span>
    </div>
  );
}

export default OraclesBoxHeader;
