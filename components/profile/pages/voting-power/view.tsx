import { ReactElement } from "react";
import { Col } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import { FlexRow } from "components/common/flex-box/view";
import ProfileLayout from "components/profile/profile-layout";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

export default function VotingPowerPageView({
  children,
}: {
  children: ReactElement;
}) {
  const { t } = useTranslation(["common", "profile"]);

  return (
    <ProfileLayout>
      <ReadOnlyButtonWrapper>
        <Col xs={12}>
          <FlexRow className="mb-3">
            <h3 className="text-white font-weight-500">
              {t("profile:voting-power")}
            </h3>
          </FlexRow>

          {children}
        </Col>
      </ReadOnlyButtonWrapper>
    </ProfileLayout>
  );
}
