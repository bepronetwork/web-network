import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { Spinner } from "react-bootstrap";
import { NumberFormatValues } from "react-number-format";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import InputNumber from "components/input-number";
import Modal from "components/modal";
import NetworkTxButton from "components/network-tx-button";
import OraclesBoxHeader from "components/oracles-box-header";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import { ApplicationContext } from "contexts/application";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Wallet } from "interfaces/authentication";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import useBepro from "x-hooks/use-bepro";

interface OraclesActionsProps {
  wallet: Wallet;
  updateWalletBalance: () => void;
}


function OraclesActions({
  wallet,
  updateWalletBalance
} : OraclesActionsProps) {
  const { t } = useTranslation(["common", "my-oracles"]);

  const actions: string[] = [
    String(t("my-oracles:actions.lock.label")),
    String(t("my-oracles:actions.unlock.label"))
  ];

  const [error, setError] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number | undefined>();
  const [networkTokenAllowance, setNetworkTokenAllowance] = useState(0);

  const networkTxRef = useRef<HTMLButtonElement>(null);

  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { handleApproveToken } = useBepro();
  const { state: { myTransactions }} = useContext(ApplicationContext);

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  const renderAmount = tokenAmount
    ? `${formatNumberToCurrency(tokenAmount)} `
    : "0";

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!myTransactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  const renderInfo = {
    Lock: {
      title: t("my-oracles:actions.lock.title", { currency: networkTokenSymbol }),
      description: 
        t("my-oracles:actions.lock.description", { currency: networkTokenSymbol }),
      label: t("my-oracles:actions.lock.get-amount-oracles", {
        amount: renderAmount
      }),
      caption: (
        <>
          {t("misc.get")} <span className="text-purple">{t("$oracles")}</span>{" "}
          {t("misc.from")} <span className="text-primary">
            {networkTokenSymbol}
          </span>
        </>
      ),
      body: 
        t("my-oracles:actions.lock.body", { 
          amount: renderAmount, 
          currency: networkTokenSymbol
        }),
      params() {
        return { tokenAmount };
      }
    },
    Unlock: {
      title: 
        t("my-oracles:actions.unlock.title", { currency: networkTokenSymbol }),
      description: 
        t("my-oracles:actions.unlock.description", { 
          currency: networkTokenSymbol
        }),
      label: t("my-oracles:actions.unlock.get-amount-bepro", {
        amount: renderAmount,
        currency: networkTokenSymbol
      }),
      caption: (
        <>
          {t("misc.get")} <span className="text-primary">
            { networkTokenSymbol}</span>{" "}
          {t("misc.from")} <span className="text-purple">{t("$oracles")}</span>
        </>
      ),
      body: t("my-oracles:actions.unlock.body", { 
        amount: renderAmount,
        currency: networkTokenSymbol
      }),
      params(from: string) {
        return { tokenAmount, from };
      }
    }
  }[action];

  const isButtonDisabled = (): boolean =>
    [
      tokenAmount < 1,
      action === t("my-oracles:actions.lock.label") && needsApproval(),
      !wallet?.address,
      tokenAmount > getMaxAmmount(),
      myTransactions.find(({ status, type }) =>
          status === TransactionStatus.pending && type === getTxType())
    ].some((values) => values);

  function handleCheck() {
    if (!tokenAmount) {
      return setError(t("my-oracles:errors.amount-higher-0", {
        currency: networkTokenSymbol
      }));
    }
    const isChecked = !needsApproval();
    setShow(isChecked);
    setError(!isChecked ? t("my-oracles:errors.approve-transactions", {
      currency: networkTokenSymbol
    }) : "")
  }

  function onSuccess() {
    setError("");
    updateWalletBalance();
  }

  function handleChangeToken(params: NumberFormatValues) {
    if (error) setError("");

    if (params.value === "") return setTokenAmount(undefined);

    if (params.floatValue < 1 || !params.floatValue) return setTokenAmount(0);

    if (params.floatValue > getMaxAmmount())
      setError(t("my-oracles:errors.amount-greater", { amount: getCurrentLabel() }));

    setTokenAmount(params.floatValue);
  }

  function handleConfirm() {
    setShow(false);
    networkTxRef?.current?.click();
  }

  function handleCancel() {
    setTokenAmount(0);
    setShow(false);
  }

  function approveSettlerToken() {
    if (!wallet?.address || !DAOService) return;

    handleApproveToken(DAOService.network.settlerToken.contractAddress, tokenAmount).then(updateAllowance);
  }

  function getCurrentLabel() {
    return action === t("my-oracles:actions.lock.label") ? networkTokenSymbol : t("$oracles");
  }

  function getMaxAmmount(): number {
    return (
      action === t("my-oracles:actions.lock.label") ?
        wallet?.balance?.bepro :
      +wallet?.balance?.oracles?.locked
    );
  }

  function setMaxAmmount() {
    return setTokenAmount(getMaxAmmount());
  }

  function getTxType() {
    return action === t("my-oracles:actions.lock.label")
      ? TransactionTypes.lock
      : TransactionTypes.unlock;
  }

  function updateAllowance() {
    DAOService.getSettlerTokenAllowance(wallet.address)
    .then(setNetworkTokenAllowance)
    .catch(console.log);
  }

  const needsApproval = () => tokenAmount > networkTokenAllowance && action === t("my-oracles:actions.lock.label");

  useEffect(() => {
    if (wallet?.address && DAOService && activeNetwork?.networkAddress) 
      updateAllowance();
  }, [wallet, DAOService, activeNetwork?.networkAddress]);

  return (
    <>
      <div className="col-md-6">
        <div className="content-wrapper h-100">
          <OraclesBoxHeader
            actions={actions}
            onChange={setAction}
            currentAction={action}
          />

          <p className="caption-small text-white text-uppercase mt-2 mb-3">
            {renderInfo?.description}
          </p>

          <InputNumber
            disabled={!wallet?.address}
            label={t("my-oracles:fields.amount.label", {
              currency: getCurrentLabel()
            })}
            symbol={`${getCurrentLabel()}`}
            classSymbol={`${
              getCurrentLabel() === t("$oracles")
                ? "text-purple"
                : "text-primary"
            }`}
            max={wallet?.balance?.bepro}
            error={!!error}
            value={tokenAmount}
            min={0}
            placeholder={t("my-oracles:fields.amount.placeholder", {
              currency: getCurrentLabel()
            })}
            onValueChange={handleChangeToken}
            thousandSeparator
            decimalSeparator="."
            decimalScale={18}
            helperText={
              <>
                {formatNumberToCurrency(getMaxAmmount(), {
                  maximumFractionDigits: 18
                })}{" "}
                {getCurrentLabel()} Available
                <span
                  className={`caption-small ml-1 cursor-pointer text-uppercase ${`${
                    getCurrentLabel() === t("$oracles")
                      ? "text-purple"
                      : "text-primary"
                  }`}`}
                  onClick={setMaxAmmount}
                >
                  {t("misc.max")}
                </span>
                {error && <p className="p-small my-2">{error}</p>}
              </>
            }
          />

          <ReadOnlyButtonWrapper>
            <div className="mt-5 d-grid gap-3">
              {action === t("my-oracles:actions.lock.label") && (
                <Button
                  disabled={!needsApproval()}
                  className="ms-0 read-only-button"
                  onClick={approveSettlerToken}
                >
                  {!needsApproval() && (
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
                </Button>
              )}

              <Button
                color={
                  action === t("my-oracles:actions.lock.label")
                    ? "purple"
                    : "primary"
                }
                className="ms-0 read-only-button"
                disabled={isButtonDisabled()}
                onClick={handleCheck}
              >
                {isButtonDisabled() && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
                <span>{renderInfo?.label}</span>
              </Button>
            </div>
          </ReadOnlyButtonWrapper>

          <NetworkTxButton
            txMethod={action.toLowerCase()}
            txType={getTxType()}
            txCurrency={getCurrentLabel()}
            txParams={renderInfo?.params(wallet?.address)}
            buttonLabel=""
            modalTitle={renderInfo?.title}
            modalDescription={renderInfo?.description}
            onSuccess={onSuccess}
            onFail={setError}
            ref={networkTxRef}
          />
        </div>
      </div>

      <Modal
        title={renderInfo?.title}
        show={show}
        titlePosition="center"
        onCloseClick={handleCancel}
        footer={
          <>
            <Button onClick={handleConfirm}>{t("actions.confirm")}</Button>
            <Button color="dark-gray" onClick={handleCancel}>
              {t("actions.cancel")}
            </Button>
          </>
        }
      >
        <p className="caption-small text-uppercase text-center mb-2">
          {renderInfo?.caption}
        </p>
        <p className="text-center h4">
          {renderInfo?.body?.split("/").map((sentence: string) => {
            const Component =
              ((sentence.startsWith("oracles") ||
                sentence.startsWith("bepro")) &&
                "span") ||
              Fragment;

            return (
              <Fragment key={sentence}>
                <Component
                  {...(sentence.startsWith("oracles") && {
                    className: "text-purple"
                  })}
                  {...(sentence.startsWith("bepro") && {
                    className: "text-primary"
                  })}
                >
                  {sentence.replace(/bepro|oracles|br/, "")}
                </Component>
                {sentence.startsWith("br") && <br />}
              </Fragment>
            );
          })}
        </p>
      </Modal>
    </>
  );
}

export default OraclesActions;
