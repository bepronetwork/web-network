import {useTranslation} from "next-i18next";

import NetworkTxButton from "components/common/network-tx-button/controller";
import InputNumber from "components/input-number";
import OraclesBoxHeader from "components/profile/pages/voting-power/oracles/box-header/view";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import {formatNumberToNScale} from "helpers/formatNumber";

import {TransactionTypes} from "interfaces/enums/transaction-types";
import { OraclesDelegateViewProps } from "interfaces/oracles-state";

export default function OraclesDelegateView({
 tokenAmount,
 handleChangeOracles,
 error,
 networkTokenDecimals,
 availableAmount,
 handleMaxAmount,
 delegatedTo,
 handleChangeAddress,
 isAddressesEqual,
 addressError,
 networkTokenSymbol,
 handleClickVerification, 
 handleProcessEvent,
 handleTransition,
 handleError,
 isButtonDisabled
}: OraclesDelegateViewProps) {
  const {t} = useTranslation(["common", "my-oracles"]);

  return (
    <div className="mt-2 col-md-6">
      <div className="bg-gray-950 border border-gray-800 border-radius-4 p-4 h-100">
        <OraclesBoxHeader
          actions={t("my-oracles:actions.delegate.title")}
        />
        <p className="caption-small text-gray-500 text-uppercase mt-2 mb-4">
          {t("my-oracles:actions.delegate.description")}
        </p>
        <InputNumber
          label={t("my-oracles:fields.oracles.label")}
          value={tokenAmount}
          symbol={t("misc.votes")}
          classSymbol="text-purple bg-gray-850"
          className="bg-gray-850"
          onValueChange={handleChangeOracles}
          min={0}
          placeholder={t("my-oracles:fields.oracles.placeholder")}
          thousandSeparator
          error={!!error}
          decimalScale={networkTokenDecimals}
          allowNegative={false}
          helperText={
            <>
              {formatNumberToNScale(availableAmount?.toString() || 0, 2, '')}{" "}
              {t("misc.votes")}
              <span
                className="caption-small ml-1 cursor-pointer text-uppercase text-purple"
                onClick={handleMaxAmount}
              >
                {t("misc.max")}
              </span>
              {error && <p className="p-small my-2">{error}</p>}
            </>
          }
        />

        <div className="form-group mt-4 mb-4">
          <label className="caption-small text-uppercase text-gray-500 bg-opacity-100 mb-2">
            {t("my-oracles:fields.address.label")}
          </label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className={`form-control bg-gray-850 ${
              ((isAddressesEqual || addressError)&& "is-invalid") || ""
            }`}
            placeholder={t("my-oracles:fields.address.placeholder")}
          />
          {isAddressesEqual ? (
            <small className="text-danger">
              {t("my-oracles:errors.self-delegate", { token: networkTokenSymbol })}
            </small>
          ) : null}
          {addressError ? (
            <small className="text-danger">
              {addressError}
            </small>
          ) : null}
        </div>

        <ReadOnlyButtonWrapper>
          <NetworkTxButton
            txMethod="delegateOracles"
            className="read-only-button"
            txParams={{ tokenAmount, from: delegatedTo }}
            txType={TransactionTypes.delegateOracles}
            txCurrency={t("$oracles", { token: networkTokenSymbol })}
            modalTitle={t("my-oracles:actions.delegate.title", { token: networkTokenSymbol })}
            modalDescription={t("my-oracles:actions.delegate.delegate-to-address",
                              { token: networkTokenSymbol })}
            onTxStart={handleClickVerification}
            handleEvent={handleProcessEvent}
            onSuccess={handleTransition}
            onFail={handleError}
            buttonLabel={t("my-oracles:actions.delegate.label")}
            fullWidth={true}
            disabled={isButtonDisabled}
          />
        </ReadOnlyButtonWrapper>
      </div>
    </div>
  );
}