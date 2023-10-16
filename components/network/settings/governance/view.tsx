import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Card from "components/card";
import CopyButton from "components/common/buttons/copy/controller";
import ContractButton from "components/contract-button";
import AmountCard from "components/custom-network/amount-card";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import SubmitButton from "components/network/settings/submit-button/view";
import NetworkTabContainer from "components/network/settings/tab-container/view";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";

import { Token } from "interfaces/token";

import { AmountCardProps } from "types/components";

interface NetworkGovernanceSettingsViewProps {
  networkAmounts: AmountCardProps[];
  networkAddress: string;
  isAbleToClosed?: boolean;
  isClosing?: boolean;
  networkTokens: Token[];
  isSubmitButtonVisible?: boolean;
  isSubmitButtonDisabled?: boolean;
  onCloseNetworkClick: () => void;
  onSaveChangesClick: () => void;
}

export default function NetworkGovernanceSettingsView({
  networkAmounts,
  networkAddress,
  isAbleToClosed,
  isClosing,
  networkTokens,
  isSubmitButtonVisible,
  isSubmitButtonDisabled,
  onCloseNetworkClick,
  onSaveChangesClick,
}: NetworkGovernanceSettingsViewProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  return (
    <NetworkTabContainer>
      <Row className="align-items-center mt-4 pt-2">
        <Col>
          <span className="caption-medium font-weight-medium text-white text-capitalize">
            {t("custom-network:network-info")}
          </span>
        </Col>

        <SubmitButton
          isVisible={isSubmitButtonVisible}
          isDisabled={isSubmitButtonDisabled}
          onClick={onSaveChangesClick}
        />
      </Row>

      <Row className="mt-0 gy-3">
        {networkAmounts.map((amount) => (
          <Col 
            key={amount.title}
            xs="12"
            md="4"
          >
            <AmountCard {...amount} />
          </Col>
        ))}
      </Row>

      <Row className="mt-3 gy-3 align-items-end justify-content-between">
        <Col xs="12" md="auto">
          <label className="caption-small font-weight-medium text-capitalize mb-2">
            {t("custom-network:network-address")}
          </label>

          <Card bodyClassName="py-1 px-2">
            <Row className=" justify-content-between align-items-center gx-2">
              <Col xs="auto">
                <span className="caption-medium text-capitalize font-weight-normal text-gray-50">
                  {networkAddress}
                </span>
              </Col>

              <Col xs="auto">
                <CopyButton
                  value={networkAddress}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs="12" md="auto">
          <Row className="mx-0">
            <ContractButton
              color="dark-gray"
              disabled={!isAbleToClosed || isClosing}
              withLockIcon={!isAbleToClosed}
              onClick={onCloseNetworkClick}
              isLoading={isClosing}
            >
              <span>{t("custom-network:close-network")}</span>
            </ContractButton>
          </Row>
        </Col>
      </Row>
      
      <Row className="mt-4 gy-3">
        <TokensSettings defaultSelectedTokens={networkTokens} />
      </Row>

      <div className="mt-4">
        <span className="caption-medium font-weight-medium text-white text-capitalize">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>

        <NetworkContractSettings />
      </div>

      <Row className="mt-3">
        <SubmitButton
          isVisible={isSubmitButtonVisible}
          isDisabled={isSubmitButtonDisabled}
          onClick={onSaveChangesClick}
          isMobile
        />
      </Row>
    </NetworkTabContainer>
  );
}