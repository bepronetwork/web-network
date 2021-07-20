import { forwardRef, ReactElement, useEffect, useState } from "react";
import BeproService from "../services/bepro";

const ApproveSettlerToken = forwardRef<
  HTMLButtonElement,
  {
    amount: number;
    fallback: ReactElement;
  }
>(function ApproveSettlerToken(
  { amount = 0, fallback = null },
  ref,
): JSX.Element {
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    (async function getIsApproved() {
      try {
        await BeproService.login();
        const address: string = await BeproService.getAddress();
        const isApprovedSettlerToken: boolean =
          await BeproService.network.isApprovedSettlerToken({
            address,
            amount,
          });
        setIsApproved(isApprovedSettlerToken);
      } catch (error) {
        console.log("Error", error);
      }
    })();
  }, [amount]);
  async function handleClickApproval() {
    try {
      const response = await BeproService.network.approveSettlerERC20Token();

      setIsAllowed(!!response);
    } catch (error) {
      console.log("Error", error);
    }
  }

  if (isApproved && isAllowed) {
    return fallback;
  }

  return (
    <button
      ref={ref}
      className="btn btn-md btn-lg btn-opac w-100"
      onClick={handleClickApproval}>
      Approve
    </button>
  );
});

ApproveSettlerToken.displayName = "ApproveSettlerToken";
export default ApproveSettlerToken;
