import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import InfoIconEmpty from "assets/icons/info-icon-empty";

import ContractButton from "components/contract-button";

import { RegistryEvents } from "interfaces/enums/events";

import useBepro from "x-hooks/use-bepro";
import useContractTransaction from "x-hooks/use-contract-transaction";

interface RegisterNetworkWarningProps {
  isConnected?: boolean;
  networkAddress: string;
  updateNetworkData: () => void;
}

export default function RegisterNetworkWarning({
  isConnected,
  networkAddress,
  updateNetworkData,
}: RegisterNetworkWarningProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { handleAddNetworkToRegistry } = useBepro();
  const [isRegistering, onRegister] = useContractTransaction( RegistryEvents.NetworkRegistered,
                                                              handleAddNetworkToRegistry,
                                                              t("custom-network:messages.network-registered"),
                                                              t("custom-network:errors.failed-to-register-network"));

  function handleRegisterNetwork() {
    if (!networkAddress) return;

    onRegister(networkAddress)
      .then(() => {
        return updateNetworkData();
      })
      .catch(error => {
        console.debug("Failed to add to registry", networkAddress, error);
      });
  }
  return(
    <Row className="bg-warning-opac-25 py-2 border border-warning border-radius-4 align-items-center mb-2">
      <Col xs="auto">
        <InfoIconEmpty width={12} height={12} />

        <span className="ml-1 caption-small">
          {t("custom-network:errors.network-not-registered")}
        </span>
      </Col>

      <Col xs="auto">
        <ContractButton
          color="warning"
          onClick={handleRegisterNetwork}
          disabled={!isConnected || isRegistering}
          withLockIcon={!isConnected}
          isLoading={isRegistering}
        >
          {t("actions.register")}
        </ContractButton>
      </Col>
    </Row>
  );
}