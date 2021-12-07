import React, {Fragment, useContext, useEffect, useRef, useState} from 'react';
import {NumberFormatValues} from 'react-number-format';
import InputNumber from './input-number';
import OraclesBoxHeader from './oracles-box-header';
import Modal from './modal';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import NetworkTxButton from './network-tx-button';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import { TransactionStatus } from '@interfaces/enums/transaction-status'
import {TransactionCurrency} from '@interfaces/transaction';
import {addTransaction} from '@reducers/add-transaction';
import {updateTransaction} from '@reducers/update-transaction';
import {changeBalance} from '@reducers/change-balance';
import {formatNumberToCurrency} from 'helpers/formatNumber'
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import Button from './button';
import LockedIcon from "@assets/icons/locked-icon"
import {Spinner} from 'react-bootstrap';
import useTransactions from '@x-hooks/useTransactions';
import { changeSettlerTokenApproval } from '@contexts/reducers/change-settler-token-approval';

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
  const {state: {metaMaskWallet, currentAddress, balance, oracles, myTransactions, isSettlerTokenApproved}, dispatch} = useContext(ApplicationContext);

  const [show, setShow] = useState<boolean>(false);
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number | undefined>();
  const [error, setError] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState(``);

  const networkTxRef = useRef<HTMLButtonElement>(null);
  const renderAmount = tokenAmount ? `${formatNumberToCurrency(tokenAmount)} ` : "0";

  const txWindow = useTransactions();

  const verifyTransactionState = (type: TransactionTypes): boolean => !!myTransactions.find(transactions=> transactions.type === type && transactions.status === TransactionStatus.pending);

  const renderInfo = {
    Lock: {
      title: "Lock $BEPRO",
      description: "Lock $BEPRO to receive ORACLES",
      label: `Get ${renderAmount} ORACLES`,
      caption: <>Get <span className="text-purple">Oracles</span> from <span className="text-blue">$BEPRO</span></>,
      body: `You are locking /bepro${renderAmount} $BEPRO /br/ to get /oracles${renderAmount} Oracles`,
      params() {
        return { tokenAmount };
      },
    },
    Unlock: {
      title: "Unlock $BEPRO",
      description: "Get $BEPRO from ORACLES",
      label: `Get ${renderAmount} $BEPRO`,
      caption: <>Get <span className="text-blue">$BEPRO</span> from <span className="text-purple">Oracles</span></>,
      body: `Give away /oracles${renderAmount} Oracles/ /br/ to get back /bepro${renderAmount} $BEPRO`,
      params(from: string) {
        return { tokenAmount, from };
      },
    },
  }[action];

  function updateErrorsAndApproval(bool: boolean) {
    setError(
      !bool ? "Please approve BEPRO Transactions First. Check it and try again." : "",
    );
  }

  function handleCheck(isChecked: boolean) {
    if (!tokenAmount) {
      return setError("$BEPRO amount needs to be higher than 0.");
    }
    setShow(isChecked);
    updateErrorsAndApproval(isChecked)
  }

  function updateValues() {
    BeproService.getBalance('bepro')
                .then(amount => {
                  BeproService?.network
                              ?.isApprovedSettlerToken({address: currentAddress, amount})
                              ?.then(updateErrorsAndApproval)
                })
  }

  function onSuccess() {
    setError("");

    BeproService.getBalance('bepro')
                .then(bepro => dispatch(changeBalance({bepro})))

    BeproService.getOraclesSummary()
    .then(oracles => {
      dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles)))
    });
  }

  function updateWalletAddress() {
    if (!currentAddress)
      return;

    setWalletAddress(currentAddress);
    updateValues();
  }

  function handleChangeToken(params: NumberFormatValues) {
    if(error)
      setError("")

    if (params.value === '')
      return setTokenAmount(undefined)

    if(params.floatValue < 1 || !params.floatValue)
      return setTokenAmount(0)

    if (params.floatValue > getMaxAmmount())
      setError(`Amount is greater than your ${getCurrentLabel()} amount`)

    setTokenAmount(params.floatValue);
  }

  function handleConfirm() {
    setShow(false);
    networkTxRef.current.click();
  }

  function handleCancel() {
    setTokenAmount(0);
    setShow(false);
    updateValues();
  }

  const isButtonDisabled = (): boolean => [
    tokenAmount < 1,
    action === 'Lock' && !isSettlerTokenApproved,
    !currentAddress,
    tokenAmount > getMaxAmmount(),
    myTransactions.find(({status, type}) =>
                          status === TransactionStatus.pending && type === getTxType())
  ].some(values => values)

  const isApproveButtonDisabled = (): boolean => [
    isSettlerTokenApproved
  ].some(value => value === true)

  function approveSettlerToken() {
    if (!currentAddress)
      return;

    const approveTx = addTransaction({type: TransactionTypes.approveSettlerToken});
    dispatch(approveTx);
    BeproService.network.approveSettlerERC20Token()
                .then((txInfo) => {
                  txWindow.updateItem(approveTx.payload.id, BeproService.parseTransaction(txInfo, approveTx.payload));
                  dispatch(changeSettlerTokenApproval(true))
                  setError(``);
                })
                .catch(e => {
                  if (e?.message?.search(`User denied`) > -1)
                    dispatch(updateTransaction({...approveTx.payload as any, remove: true}));
                  else dispatch(updateTransaction({...approveTx.payload as any, status: TransactionStatus.failed}));

                  console.error(`Failed to approve settler token`, e);
              })
  }

  function checkLockedAmount() {
    if (!currentAddress)
      return;

    BeproService.network
                ?.isApprovedSettlerToken({address: BeproService.address, amount: tokenAmount})
                ?.then(handleCheck);
  }

  function getCurrentLabel(): TransactionCurrency {
    return action === `Lock` && `$BEPRO` || `Oracles`
  }

  function getMaxAmmount(): number {
    return action === `Lock` && balance.bepro || (+oracles.tokensLocked - oracles.delegatedToOthers);
  }

  function setMaxAmmount() {
    return setTokenAmount(getMaxAmmount())
  }

  function getTxType() {
    return action === `Lock` ? TransactionTypes.lock : TransactionTypes.unlock;
  }

  useEffect(updateWalletAddress, [currentAddress])

  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper h-100">
          <OraclesBoxHeader actions={actions} onChange={setAction} currentAction={action} available={getMaxAmmount()} />

          <p className="caption-small text-white text-uppercase mt-2 mb-3">{renderInfo.description}</p>

          <InputNumber
            disabled={!isSettlerTokenApproved || !metaMaskWallet}
            label={`${getCurrentLabel()} Amount`}
            symbol={`${getCurrentLabel()}`}
            classSymbol={`${getCurrentLabel() === 'Oracles' ? "text-purple" : "text-blue"}`}
            max={balance.bepro}
            error={!!error}
            value={tokenAmount}
            min={0}
            placeholder={`Insert an amount of ${getCurrentLabel()}`}
            onValueChange={handleChangeToken}
            thousandSeparator
            decimalSeparator="."
            decimalScale={18}
            helperText={(
              <>
                {formatNumberToCurrency(getMaxAmmount(), { maximumFractionDigits: 18 })} {getCurrentLabel()} Available
                <span
                    className={`caption-small ml-1 cursor-pointer text-uppercase ${`${getCurrentLabel() === 'Oracles' ? "text-purple" : "text-blue"}`}`}
                    onClick={setMaxAmmount}>
                    Max
                </span>
                {error && <p className="p-small my-2">{error}</p>}
              </>)
            }
            />

          <div className="mt-5 d-grid gap-3">

          {action === 'Lock' && 
            <Button 
              disabled={isApproveButtonDisabled()}
              className="ms-0" 
              onClick={approveSettlerToken}
            >
                {isApproveButtonDisabled() && <LockedIcon width={12} height={12} className="mr-1"/>}
                <span>Approve {currentAddress && verifyTransactionState(TransactionTypes.approveSettlerToken) ? <Spinner size={"xs" as unknown as 'sm'} className="align-self-center ml-1" animation="border" /> : ``}</span>
            </Button>}

            <Button 
              color={action === 'Lock' ? 'purple' : 'primary'} 
              className="ms-0" 
              disabled={isButtonDisabled()}
              onClick={checkLockedAmount}
            >
                  {isButtonDisabled() && <LockedIcon width={12} height={12} className="mr-1"/>}
                  <span>{renderInfo.label}</span>
            </Button>
          </div>

          <NetworkTxButton
            txMethod={action.toLowerCase()}
            txType={getTxType()}
            txCurrency={getCurrentLabel()}
            txParams={renderInfo.params(walletAddress)}
            buttonLabel=""
            modalTitle={renderInfo.title}
            modalDescription={renderInfo.description}
            onSuccess={onSuccess}
            onFail={setError}
            ref={networkTxRef}
            useContract
            />

        </div>
      </div>

      <Modal
        title={renderInfo.title}
        show={show}
        titlePosition="center"
        onCloseClick={handleCancel}
        footer={
          <>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
            <Button color='dark-gray' onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }>
        <p className="caption-small text-uppercase text-center">
          {renderInfo.caption}
        </p>
        <p className="text-center text-bold fs-4">
          {renderInfo.body?.split("/").map((sentence: string) => {
            const Component =
              ((sentence.startsWith("oracles") || sentence.startsWith("bepro")) && "span") || Fragment;

            return (
              <Fragment key={sentence}>
                <Component
                  {...(sentence.startsWith("oracles") && {
                    className: "text-bold text-purple",
                  })}
                  {...(sentence.startsWith("bepro") && {
                    className: "text-bold text-blue",
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
