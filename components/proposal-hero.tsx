import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import ArrowLeft from "assets/icons/arrow-left";

import Avatar from "components/avatar";
import GithubInfo from "components/github-info";

import { useIssue } from "contexts/issue";

import { Proposal } from "interfaces/proposal";

import CustomContainer from "./custom-container";
import DateLabel from "./date-label";
import PriceConversor from "./price-conversor";

interface IProposalHeroProps {
  proposal: Proposal;
}

export default function ProposalHero({
  proposal,
}: IProposalHeroProps) {
  const { activeIssue } = useIssue();
  const router = useRouter();
  const { t } = useTranslation(["proposal"]);

  return (
    <div className="banner-shadow">
      <CustomContainer>
        <div className="d-flex flex-row">
          <div className="col-10 row">
            <div className="d-flex flex-row">
              <div
                className="me-2 cursor-pointer"
                onClick={() => router.back()}
              >
                <ArrowLeft
                  width={16}
                  height={16}
                  className="border rounded-circle border-primary p-1"
                />
              </div>
              <div>
                <span className="me-2 text-white-40 caption-large">
                  #{activeIssue?.githubId}
                </span>
                <span className="text-gray caption-medium">
                  {activeIssue?.title}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <h4>{t("proposal:title")}</h4>
              <h4 className="text-white-40">#{proposal?.scMergeId}</h4>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <div className="d-flex align-items-center">
                <Avatar className="me-2" userLogin={proposal?.githubLogin} />{" "}
                <GithubInfo
                  parent="hero"
                  variant="user"
                  label={["@", proposal?.githubLogin].join("")}
                />
              </div>

              {proposal?.createdAt && (
                <DateLabel date={proposal?.createdAt} className="text-white" />
              )}
            </div>
          </div>

          <div className="col-2 d-flex align-items-center justify-content-center">
            <PriceConversor
              currentValue={activeIssue?.amount || 0}
              currency="BEPRO"
            />
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
