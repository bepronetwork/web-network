import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";

export default function CreateBountyRewardInfo({
  isFunding = false,
  updateIsFunding,
  children,
}: {
  isFunding?: boolean;
  updateIsFunding?: (e: boolean) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation(["common", "bounty"]);

  return (
    <div className="mt-2">
      <h5>Reward information</h5>
      <div className="text-gray">
        When creating a new bounty, you have two options regarding the reward:
        <p className="mt-2 ms-1">
          1. Self-fund: You use your own money to create the bounty. This means
          you will be responsible for providing the reward money that will be
          given to the person who successfully completes the task.
        </p>
        <p className="ms-1">
          2. Seekfunding: You can seek funding for the bounty. This means you
          can look for other individuals who are willing to contribute to the
          reward money.
        </p>
      </div>

      <>
        <div className="d-flex">
          <label>Reward Type</label>
          <div className="mx-1 text-danger">*</div>
        </div>
        <div className="d-flex mt-1">
          <Button
            className={!isFunding ? "bounty-button" : "bounty-outline-button"}
            onClick={() => updateIsFunding(false)}
          >
            Self-fund
          </Button>
          <Button
            className={isFunding ? "bounty-button" : "bounty-outline-button"}
            onClick={() => updateIsFunding(true)}
          >
            Seek Funding
          </Button>
        </div>
      </>
      <>{children}</>
    </div>
  );
}