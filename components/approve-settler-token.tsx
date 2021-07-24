import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef, ReactElement } from "react";
import { setLoadingAttributes } from "../providers/loading-provider";
import BeproService from "../services/bepro";

interface Props extends ComponentPropsWithRef<"button"> {
  amount: number;
  onApprove: (isApproved: boolean) => void;
  onCatch?: (message: string) => void;
}

const ApproveSettlerToken = forwardRef<HTMLButtonElement, Props>(
  function ApproveSettlerToken(
    { amount, onApprove, onCatch = () => {}, className, ...props },
    ref,
  ): JSX.Element {
    async function handleClick() {
      if (!amount) {
        return onCatch("$BEPRO amount needs to be higher than 0.");
      }

      try {
        setLoadingAttributes(true);
        await BeproService.login();
        const address: string = await BeproService.getAddress();
        const isApproved: boolean =
          await BeproService.network.isApprovedSettlerToken({
            address,
            amount,
          });

        if (isApproved) {
          const response =
            await BeproService.network.approveSettlerERC20Token();

          onApprove(response.status);
        }

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
