import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import ArrowLeft from "assets/icons/arrow-left";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";

import {useAppState} from "contexts/app-state";

import { truncateAddress } from "helpers/truncate-address";

import {Proposal} from "interfaces/proposal";

interface ProposalHeroProps {
  proposal: Proposal;
}

export default function ProposalHero({
  proposal,
}: ProposalHeroProps) {
  const {state} = useAppState();
  const router = useRouter();
  const { t } = useTranslation(["proposal", "common"]);

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
                  #{state.currentBounty?.data?.githubId}
                </span>
                <span className="text-gray caption-medium">
                  {state.currentBounty?.data?.title}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <h4>{t("proposal:title")}</h4>
              <h4 className="text-white-40">#{+(proposal?.contractId || 0) + 1}</h4>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <div className="d-flex align-items-center">
                <div className="mr-1">
                  <AvatarOrIdenticon
                    user={proposal?.githubLogin}
                    address={proposal?.creator}
                    size="sm"
                  />
                </div>
                
                <GithubInfo
                  parent="hero"
                  variant="user"
                  label={proposal?.githubLogin ? `@${proposal?.githubLogin}` : truncateAddress(proposal?.creator)}
                />
              </div>

              {proposal?.createdAt && (
                <DateLabel date={proposal?.createdAt} className="text-white" />
              )}
            </div>
          </div>

          <div className="col-2 d-flex align-items-center justify-content-center">
            <PriceConversor
              currentValue={state.currentBounty?.data?.amount}
              currency={state.currentBounty?.data?.transactionalToken?.symbol || t('common:misc.token')}
            />
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
