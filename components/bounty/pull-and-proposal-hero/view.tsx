import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowLeft from "assets/icons/arrow-left";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import Button from "components/button";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";

import { truncateAddress } from "helpers/truncate-address";

interface PullAndProposalHeroViewPRops {
  contractId: number;
  githubLogin: string;
  createdAt: Date;
  creatorAddress: string;
  issueTitle: string;
  issueId: string;
  issueAmount: BigNumber;
  transactionalTokenSymbol: string;
  isProposal: boolean;
  onBackClick: () => void;
}

export default function PullAndProposalHeroView({
  contractId,
  githubLogin,
  createdAt,
  creatorAddress,
  issueTitle,
  issueId,
  isProposal,
  issueAmount,
  transactionalTokenSymbol,
  onBackClick,
}: PullAndProposalHeroViewPRops) {
  const { t } = useTranslation([isProposal ? "proposal" : "deliverable", "common"]);

  return (
    <div className="w-100 border-bottom border-gray-800">
      <CustomContainer className="p-3">
        <div className="row align-items-start mb-4">
          <div className="col-auto">
            <Button
              className="rounded-circle p-1 text-white not-svg mt-1"
              onClick={onBackClick}
              outline
            >
              <ArrowLeft width={10} height={10} />
            </Button>
          </div>

          <div className="col-auto px-0">
            <span className="me-2 text-gray-500 caption-large font-weight-medium">
              #{issueId}
            </span>
          </div>

          <div className="col px-0">
            <span className="text-white caption-large font-weight-medium text-capitalize">
              {issueTitle}
            </span>
          </div>
        </div>

        <div className="row align-items-center mb-4">
          <div className="col">
            <div className="row align-items-center">
              <span className="caption-large text-white text-capitalize">
                {t("title")}

                <span className="ml-1 text-gray-500 font-weight-medium">
                  #{+(contractId || 0) + 1}
                </span>
              </span>
            </div>
          </div>

          <div className="col-auto">
            <PriceConversor
              currentValue={issueAmount}
              currency={transactionalTokenSymbol || t("common:misc.token")}
            />
          </div>
        </div>

        <div className="row align-items-center gy-2">
          <div className="col-xs-12 col-xl-auto">
            <div className="row align-items-center gap-1">
              <div className="col-auto">
                <AvatarOrIdenticon
                  user={githubLogin}
                  address={creatorAddress}
                  size="sm"
                />
              </div>

              <div className="col-auto px-0">
                <GithubInfo
                  parent="hero"
                  variant="user"
                  label={
                    githubLogin
                      ? `@${githubLogin}`
                      : truncateAddress(creatorAddress)
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-xs-12 col-xl-auto">
            <DateLabel date={createdAt} className="text-white" />
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
