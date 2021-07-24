import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";
import { setLoadingAttributes } from "../providers/loading-provider";
import BeproService from "../services/bepro";

interface Props extends ComponentPropsWithRef<"button"> {
  onApprove: (isApproved: boolean) => void;
}

const ApproveSettlerToken = forwardRef<HTMLButtonElement, Props>(
  function ApproveSettlerToken(
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
        console.log("Error", error);
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

ApproveSettlerToken.displayName = "ApproveSettlerToken";
export default ApproveSettlerToken;
