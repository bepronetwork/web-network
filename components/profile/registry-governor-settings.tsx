import { useContext } from "react";
import { Col, Row } from "react-bootstrap";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import TokensSettings from "components/tokens-settings";

import { ApplicationContext } from "contexts/application";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BlockTransaction } from "interfaces/transaction";

import useTransactions from "x-hooks/useTransactions";

export default function RegistryGovernorSettings() {
  const { t } = useTranslation(["common", "custom-network"]);
  const { dispatch } = useContext(ApplicationContext);
  const { fields, settings } = useNetworkSettings();
  const {  activeNetwork, updateActiveNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const txWindow = useTransactions();

  async function handleFeeSettings(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.configFees }, activeNetwork);

      dispatch(transaction);

      await DAOService.updateConfigFees(settings?.treasury?.closeFee?.value,
                                        settings?.treasury?.cancelFee?.value)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }
  async function saveFeeSettings() {
    await handleFeeSettings().then(() => updateActiveNetwork())
  }

  return (
    <>
      <Row className="mb-3">
        <h3 className="text-capitalize family-Regular text-white">
          {t("custom-network:registry.title-governor")}
        </h3>
      </Row>

      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">{t("custom-network:registry.config-fees")}</span>

        <Col>
          <NetworkParameterInput
            key="cancel-fee"
            label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
            symbol="%"
            value={settings?.treasury?.cancelFee?.value}
            error={settings?.treasury?.cancelFee?.validated === false}
            onChange={fields.cancelFee.setter}
          />
        </Col>

        <Col>
          <NetworkParameterInput
          key="close-fee"
            label={t("custom-network:steps.treasury.fields.close-fee.label")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            error={settings?.treasury?.closeFee?.validated === false}
            onChange={fields.closeFee.setter}
          />
        </Col>
        <Col xs={4}>
          <Button onClick={saveFeeSettings} className="mt-4">
            <span>{t("custom-network:registry.save-fees-config")}</span>
          </Button>
        </Col>
      </Row>

      <TokensSettings isGovernorRegistry={true} />
    </>
  );
}
