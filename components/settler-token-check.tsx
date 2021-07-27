import clsx from "clsx";
import { ComponentPropsWithRef, forwardRef } from "react";
import { setLoadingAttributes } from "providers/loading-provider";
import BeproService from "services/bepro";

interface Props extends ComponentPropsWithRef<"button"> {
  onCheck(isChecked: boolean): void;
  amount: number;
}

const SettlerTokenCheck = forwardRef<HTMLButtonElement, Props>(
  function SettlerTokenCheck(
    { onCheck, amount, className, ...props },
    ref,
  ): JSX.Element {
    async function handleClick() {
      try {
        setLoadingAttributes(true);
        const address: string = await BeproService.getAddress();
        const isApprovedSettlerToken: boolean =
          await BeproService.network.isApprovedSettlerToken({
            address,
            amount,
          });

        onCheck(isApprovedSettlerToken);
        setLoadingAttributes(false);
      } catch (error) {
        console.log("SettlerTokenCheck", error);
        setLoadingAttributes(false);
      }
    }

    return (
      <button
        ref={ref}
        className={clsx("btn btn-md btn-lg btn-primary w-100", className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);

SettlerTokenCheck.displayName = "SettlerTokenCheck";
export default SettlerTokenCheck;
