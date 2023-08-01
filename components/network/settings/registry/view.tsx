
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Card from "components/card";
import CopyButton from "components/common/buttons/copy/controller";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import { FormGroup } from "components/form-group";
import If from "components/If";
import LoadingGlobal from "components/loading-global";
import SubmitButton from "components/network/settings/submit-button/view";
import NetworkTabContainer from "components/network/settings/tab-container/view";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";
import { WarningSpan } from "components/warning-span";

import { REGISTRY_LIMITS } from "helpers/registry";

import { Token } from "interfaces/token";

import { Field } from "types/utils";

interface NetworkRegistrySettingsViewProps {
  isExecuting?: boolean;
  changingLabel?: string;
  treasuryAddress: string;
  isGovernorRegistry?: boolean;
  isFieldsDisabled?: boolean;
  cancelFeePercentage: Field;
  closeFeePercentage: Field;
  creationFeePercentage: Field;
  creationLockAmount: Field;
  registryTokenSymbol: string;
  isSubmitButtonVisible?: boolean;
  isSubmitButtonDisabled?: boolean;
  onCancelFeePercentageChange: (value: number) => void;
  onCloseFeePercentageChange: (value: number) => void;
  onCreationFeePercentageChange: (value: string) => void;
  onCreationLockAmountChange: (value: string) => void;
  onTokensChanged: (transactional: Token[], reward: Token[]) => void;
  onSaveChangesClick: () => void;
}

export default function NetworkRegistrySettingsView({
  isExecuting,
  changingLabel,
  treasuryAddress,
  isGovernorRegistry,
  isFieldsDisabled,
  cancelFeePercentage,
  closeFeePercentage,
  creationFeePercentage,
  creationLockAmount,
  registryTokenSymbol,
  isSubmitButtonVisible,
  isSubmitButtonDisabled,
  onCancelFeePercentageChange,
  onCloseFeePercentageChange,
  onCreationFeePercentageChange,
  onCreationLockAmountChange,
  onTokensChanged,
  onSaveChangesClick,
}: NetworkRegistrySettingsViewProps) {
  const { t } = useTranslation(["common", "custom-network", "setup"]);

  return (
    <NetworkTabContainer>
      <LoadingGlobal show={isExecuting} dialogClassName="modal-md">
        {t("misc.changing")} {changingLabel}
      </LoadingGlobal>

      <Row className="my-3 align-items-center">
        <Col>
          <span className="caption-large text-white text-capitalize font-weight-medium mb-3">
            {isGovernorRegistry
              ? t("custom-network:registry.config-fees")
              : t("custom-network:steps.network-settings.fields.fees.title")}
          </span>
        </Col>
        
        <SubmitButton
          isVisible={isSubmitButtonVisible}
          isDisabled={isSubmitButtonDisabled}
          onClick={onSaveChangesClick}
        />
      </Row>

      <Row className="mb-5">
        <Col xs="12" xl="6">
          <Card>
            <Row className="mb-3">
              <span className="caption-medium text-capitalize font-weight-medium text-gray-200">
                {t("custom-network:steps.treasury.fields.address.label")}
              </span>
            </Row>
            
            <Row className="align-items-center">
              <Col>
                <span className="caption-medium text-capitalize font-weight-normal text-gray-50">
                  {treasuryAddress}
                </span>
              </Col>

              <Col xs="auto">
                <CopyButton
                  value={treasuryAddress}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row className="align-items-top mb-5 gy-3">
        <NetworkParameterInput
          disabled={isFieldsDisabled}
          key="cancel-fee"
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.cancel-fee.description", REGISTRY_LIMITS["cancelFeePercentage"])
          }
          symbol="%"
          value={+cancelFeePercentage?.value}
          error={!!cancelFeePercentage?.error}
          errorMessage={cancelFeePercentage?.error}
          onChange={onCancelFeePercentageChange}
        />
          
        <NetworkParameterInput
          disabled={isFieldsDisabled}
          key="close-fee"
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          description={
            t("custom-network:steps.treasury.fields.close-fee.description", REGISTRY_LIMITS["closeFeePercentage"])
          }
          symbol="%"
          value={+closeFeePercentage?.value}
          error={!!closeFeePercentage?.error}
          errorMessage={closeFeePercentage?.error}
          onChange={onCloseFeePercentageChange}
        />

        <FormGroup
          label={t("setup:registry.fields.network-creation-fee.label")}
          placeholder="0"
          symbol="%"
          value={creationFeePercentage?.value?.toString()}
          onChange={onCreationFeePercentageChange}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-fee.description")}
          error={creationFeePercentage?.error}
          disabled={isFieldsDisabled}
          colProps={{ xs: "12", md: "6", xl: "3" }}
        />

        <FormGroup
          label={t("setup:registry.fields.network-creation-amount.label")}
          placeholder="0"
          value={creationLockAmount?.value?.toString()}
          onChange={onCreationLockAmountChange}
          variant="numberFormat"
          description={t("setup:registry.fields.network-creation-amount.description")}
          disabled={isFieldsDisabled}
          error={creationLockAmount?.error}
          symbol={registryTokenSymbol}
          colProps={{ xs: "12", md: "6", xl: "3" }}
        />
      </Row>

      <If condition={isGovernorRegistry}>
        <Row className="mt-5">
          <TokensSettings 
            isGovernorRegistry={true}
            disabled={isFieldsDisabled}
            onChangeCb={onTokensChanged}
          />
        </Row>
      </If>

      <If condition={!isGovernorRegistry}>
        <Row className="mb-4">
          <WarningSpan
            text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
          />
        </Row>
      </If>

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