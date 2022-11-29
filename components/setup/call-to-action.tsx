import Button from "components/button";
import {ContextualSpan} from "components/contextual-span";

export function CallToAction({
  call,
  action,
  onClick,
  color,
  disabled,
  executing
}) {
  return(
    <ContextualSpan
      context={color}
      className="mb-3"
      isAlert
    >
      <span className="col">{call}</span>
      <Button
        color={color}
        disabled={executing || disabled}
        withLockIcon={disabled && !executing}
        isLoading={executing}
        onClick={onClick}>
        <span>{action}</span>
      </Button>
    </ContextualSpan>
  );
}