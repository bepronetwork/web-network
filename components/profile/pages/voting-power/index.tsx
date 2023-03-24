import {Col} from "react-bootstrap";

import {useTranslation} from "next-i18next";
import { useRouter } from "next/router";

import If from "components/If";
import VotingPowerMultiNetwork from "components/profile/pages/voting-power//voting-power-multi-network";
import VotingPowerNetwork from "components/profile/pages/voting-power/voting-power-network";
import ProfileLayout from "components/profile/profile-layout";
import {FlexRow} from "components/profile/wallet-balance";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

export default function VotingPowerPage() {
  const { query } = useRouter();
  const { t } = useTranslation(["common", "profile"]);

  const { network } = query;

  const isOnNetwork = !!network;

  return(
    <ProfileLayout>
      <ReadOnlyButtonWrapper>
        <Col xs={11}>
          <FlexRow className="mb-3">
            <h3 className="text-white font-weight-500">Voting Power</h3>
          </FlexRow>

          <If
            condition={isOnNetwork}
            otherwise={<VotingPowerMultiNetwork />}
          >
            <VotingPowerNetwork />
          </If>

        </Col>
      </ReadOnlyButtonWrapper>
    </ProfileLayout>
  );
}