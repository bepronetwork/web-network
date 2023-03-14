import { useState } from "react";
import { FormCheck } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import ReactSelect from "components/react-select";

export default function CreateBountyRewardInfo() {
  const { t } = useTranslation(["common", "bounty"]);
  const [isFunding, setIsFunding] = useState<boolean>(false);

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
          <Button outline onClick={() => setIsFunding(false)}>
            Self-fund
          </Button>
          <Button onClick={() => setIsFunding(true)}>Seek Funding</Button>
        </div>
      </>
      <>
        <div className="d-flex mt-4">
          <label>{isFunding ? "Set Funded Reward" : "Set Reward"}</label>
        </div>
        {isFunding ? (
          <>
            <div className="col-6 p-4 border-radius-8 border border-gray-700">
              21,303
            </div>

            <div className="col-12 mt-4">
              <FormCheck
                className="form-control-md pb-0"
                type="checkbox"
                label={t("bounty:reward-funders")}
                onChange={() => {
                  null;
                }}
                checked={false}
              />
              <p className="text-gray ms-4">
                Reward anyone who funds this bounty.
              </p>
            </div>
          </>
        ) : (
          <div className="p-2 border-radius-8 border border-gray-700">
            <div className="col-6 d-flex">
              <ReactSelect />
              <div className="col-4 ms-2">
                <Button outline>Use Max</Button>
              </div>
            </div>
            <div className="mt-1 col-12 border-radius-8 border border-gray-700 bg-gray-850">
              aaa
            </div>
          </div>
        )}
      </>
    </div>
  );
}
