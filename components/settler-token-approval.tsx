import { ComponentPropsWithRef, forwardRef, useContext } from "react";

import clsx from "clsx";

import { ApplicationContext } from "contexts/application";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { BeproService } from "services/bepro-service";

interface Props extends ComponentPropsWithRef<"button"> {
  onApprove: (isApproved: boolean) => void;
}

const SettlerTokenApproval = forwardRef<HTMLButtonElement, Props>(
  function SettlerTokenApproval(
    { onApprove, className, ...props },
    ref
  ): JSX.Element {
    const { dispatch } = useContext(ApplicationContext);

    async function handleClick() {
      try {
        dispatch(changeLoadState(true));
        const response = await BeproService.network.approveSettlerERC20Token();

        onApprove(!!response.status);
        dispatch(changeLoadState(false));
      } catch (error) {
        console.error("SettlerTokenApproval", error);
        dispatch(changeLoadState(false));
        onApprove(false);
      }
    }

    return (
      <button
        ref={ref}
        className={clsx("btn btn-md btn-lg btn-opac w-100", className)}
        onClick={handleClick}
        {...props}
      >
        Approve
      </button>
    );
  }
);

SettlerTokenApproval.displayName = "SettlerTokenApproval";
export default SettlerTokenApproval;
