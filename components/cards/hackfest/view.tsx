import Link from "next/link";

import Badge from "components/badge";
import CustomContainer from "components/custom-container";

export default function HackFestCard() {
  return(
    <CustomContainer>
      <div className="px-2 px-xl-0">
        <div className="row border-radius-8 border border-blue-600 p-4 hackerfest-card-bg mt-3">
          <div className="col p-2">
            <div className="row align-items-center justify-content-between mb-1">
              <div className="col-auto">
                <span className="hack-fest-title text-white">
                  Join the Hackfest
                </span>
              </div>

              <div className="col-auto">
                <Badge
                  className="rounded-pill xs-medium text-uppercase text-green-500 border border-green-500 px-3"
                  label="Live now"
                  color="green-500-90"
                />
              </div>
            </div>

            <div className="row">
              <span className="xs-medium text-blue-50 font-weight-normal mb-3">
                Create a task in less than 3 minutes, pay with crypto and drive your project forward.
              </span>
            </div>
            <div className="row mb-4">
              <span className="xs-medium text-blue-50 font-weight-normal mb-3">
                If you're a builder, join the party! Browse dozens of tasks in the Open-Marketplace, solve them and earn crypto.
              </span>
            </div>

            <div className="row">
              <div className="col-auto">
                <Link href="/open-marketplace/polygon">
                  <span className={`rounded-pill xs-medium px-3 py-2 bg-white-10 
                    bg-white-30-hover cursor-pointer text-uppercase`}>
                    <span className="px-1 py-1">
                      Join Now
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomContainer>
  );
}