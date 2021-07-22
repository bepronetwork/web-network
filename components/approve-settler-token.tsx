import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef, ReactElement } from "react";
import { setLoadingAttributes } from "../providers/loading-provider";
import BeproService from "../services/bepro";

interface Props extends ComponentPropsWithRef<"button"> {
  amount: number;
  onApprove: (isApproved: boolean) => void;
}

const ApproveSettlerToken = forwardRef<HTMLButtonElement, Props>(
  function ApproveSettlerToken(
    { amount = 0, onApprove = () => {}, className, ...props },
    ref,
  ): JSX.Element {
    async function handleClickApproval() {
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
          // Can't be destructured since response can't even come due to data error processment.
          // todo: notice if it can be done in a better way
          const isAllowed = response.status;

          if (isAllowed) {
            onApprove(isAllowed);
            setLoadingAttributes(false);
          }
        }
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
        onClick={handleClickApproval}
        {...props}>
        Approve
      </button>
    );
  },
);

ApproveSettlerToken.displayName = "ApproveSettlerToken";
export default ApproveSettlerToken;
