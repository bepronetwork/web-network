import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";
import { setLoadingAttributes } from "providers/loading-provider";
import BeproService from "services/bepro";

interface Props extends ComponentPropsWithRef<"button"> {
  onApprove: (isApproved: boolean) => void;
}

const SettlerTokenApproval = forwardRef<HTMLButtonElement, Props>(
  function SettlerTokenApproval(
    { onApprove, className, ...props },
    ref,
  ): JSX.Element {
    async function handleClick() {
      try {
        setLoadingAttributes(true);
        const response = await BeproService.network.approveSettlerERC20Token();

        onApprove(response.status);
        setLoadingAttributes(false);
      } catch (error) {
        console.log("SettlerTokenApproval", error);
        setLoadingAttributes(false);
        onApprove(false);
      }
    }

    return (
      <button
        ref={ref}
        className={clsx("btn btn-md btn-lg btn-opac w-100", className)}
        onClick={handleClick}
        {...props}>
        Approve
      </button>
    );
  },
);

SettlerTokenApproval.displayName = "SettlerTokenApproval";
export default SettlerTokenApproval;
