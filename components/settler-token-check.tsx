import clsx from "clsx";
import {ComponentPropsWithRef, forwardRef, useContext} from 'react';
import {BeproService} from "@services/bepro-service";
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';

interface Props extends ComponentPropsWithRef<"button"> {
  onCheck(isChecked: boolean): void;
  amount: number;
}

const SettlerTokenCheck = forwardRef<HTMLButtonElement, Props>(
  function SettlerTokenCheck(
    { onCheck, amount, className, ...props },
    ref,
  ): JSX.Element {
    const {dispatch} = useContext(ApplicationContext);
    async function handleClick() {
      try {
        dispatch(changeLoadState(true));
        const address: string = BeproService.address;
        const isApprovedSettlerToken: boolean =
          await BeproService.network.isApprovedSettlerToken(amount, address);

        onCheck(isApprovedSettlerToken);
        dispatch(changeLoadState(false));
      } catch (error) {
        console.error("SettlerTokenCheck", error);
        dispatch(changeLoadState(false));
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
