import React from "react";
import {Spinner} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import NetworkTxButton from "components/common/network-tx-button/controller";
import ContractButton from "components/contract-button";
import InputNumber from "components/input-number";
import OraclesBoxHeader from "components/profile/pages/voting-power/oracles/box-header/view";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import { formatStringToCurrency} from "helpers/formatNumber";

import {TransactionTypes} from "interfaces/enums/transaction-types";
import { OraclesActionsViewProps } from "interfaces/oracles-state";

import ModalOraclesActionView from "./modal-actions/view";

export default function OraclesActionsView({
  wallet,
  actions,
  action,
  handleAction,
  renderInfo,
  currentLabel,
  networkTokenSymbol,
  error,
  tokenAmount,
  handleChangeToken,
  networkTokenDecimals,
  getMaxAmount,
  handleMaxAmount,
  needsApproval,
  isApproving,
  approveSettlerToken,
  verifyTransactionState,
  isButtonDisabled,
  handleCheck,
  txType,
  handleProcessEvent,
  onSuccess,
  handleError,
  networkTxRef,
  show,
  handleCancel,
  handleConfirm
} : OraclesActionsViewProps) {
  const { t } = useTranslation(["common", "my-oracles"]);

  return (
    <>
      <div className="mt-2 col-md-6">
        <div className="bg-gray-950 border border-gray-800 border-radius-4 p-4 h-100">
          <OraclesBoxHeader
            actions={actions}
            onChange={handleAction}
            currentAction={action}
          />

          <p className="caption-small text-gray-500 font-weight-500 text-uppercase mt-2 mb-4">
            {renderInfo?.description}
          </p>

          <InputNumber
            disabled={!wallet?.address}
            className="bg-gray-850"
            label={t("my-oracles:fields.amount.label", {
              currency: currentLabel
            })}
            symbol={`${currentLabel}`}
            classSymbol={`bg-gray-850 ${
              currentLabel === t("$oracles", { token: networkTokenSymbol })
                ? "text-purple"
                : "text-primary"
            }`}
            max={wallet?.balance?.bepro?.toFixed()}
            error={!!error}
            value={tokenAmount}
            min={0}
            placeholder={t("my-oracles:fields.amount.placeholder", {
              currency: currentLabel
            })}
            onValueChange={handleChangeToken}
            thousandSeparator
            decimalSeparator="."
            allowNegative={false}
            decimalScale={networkTokenDecimals}
            helperText={
              <>
                {formatStringToCurrency(getMaxAmount())}{" "}
                {currentLabel} {t("misc.available")}
                <span onClick={handleMaxAmount}
                      className={`caption-small ml-1 cursor-pointer text-uppercase ${(
                        currentLabel === t("$oracles", { token: networkTokenSymbol })
                          ? "text-purple"
                          : "text-primary"
                      )}`}>
                  {t("misc.max")}
                </span>
                {error && <p className="p-small my-2">{error}</p>}
              </>
            }
          />

          <ReadOnlyButtonWrapper>
            <div className="mt-5 d-grid gap-3">
              {action === t("my-oracles:actions.lock.label") && (
                <ContractButton
                  disabled={!needsApproval || isApproving}
                  className="ms-0 read-only-button mt-3"
                  onClick={approveSettlerToken}
                >
                  {!needsApproval && (
                    <LockedIcon width={12} height={12} className="mr-1" />
                  )}
                  <span>
                    {t("actions.approve")}{" "}
                    {wallet?.address &&
                    verifyTransactionState(TransactionTypes.approveSettlerToken) ? (
                      <Spinner
                        size={"xs" as unknown as "sm"}
                        className="align-self-center ml-1"
                        animation="border"
                      />
                    ) : (
                      ""
                    )}
                  </span>
                </ContractButton>
              )}

              <ContractButton
                color={
                  action === t("my-oracles:actions.lock.label")
                    ? "purple"
                    : "primary"
                }
                className="ms-0 read-only-button"
                disabled={isButtonDisabled}
                onClick={handleCheck}
              >
                {isButtonDisabled && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
                <span>{renderInfo?.label}</span>
              </ContractButton>
            </div>
          </ReadOnlyButtonWrapper>

          <NetworkTxButton
            txMethod={action.toLowerCase()}
            txType={txType}
            txCurrency={currentLabel}
            handleEvent={handleProcessEvent}
            txParams={renderInfo?.params(wallet?.address)}
            buttonLabel=""
            modalTitle={renderInfo?.title}
            modalDescription={renderInfo?.description}
            onSuccess={onSuccess}
            onFail={handleError}
            buttonConfirmRef={networkTxRef}
          />
        </div>
      </div>

      <ModalOraclesActionView 
        renderInfo={renderInfo} 
        show={show} 
        handleCancel={handleCancel} 
        handleConfirm={handleConfirm}      
      />
    </>
  );
}