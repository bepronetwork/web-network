import {Fragment, useContext, useEffect, useRef, useState} from 'react';
import {NumberFormatValues} from 'react-number-format';
import InputNumber from './input-number';
import OraclesBoxHeader from './oracles-box-header';
import Modal from './modal';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import {changeLoadState} from '@reducers/change-load-state';
import ApproveButton from './approve-button';
import TransferOraclesButton from './transfer-oracles-button';
import NetworkTxButton from './network-tx-button';
import {changeBalance} from '@reducers/change-balance';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import { TransactionStatus } from '@interfaces/enums/transaction-status'
import {TransactionCurrency} from '@interfaces/transaction';
import {addTransaction} from '@reducers/add-transaction';
import {updateTransaction} from '@reducers/update-transaction';
import {formatNumberToCurrency} from 'helpers/formatNumber'
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
  const {state: {beproInit, metaMaskWallet, currentAddress, balance, oracles, myTransactions}, dispatch} = useContext(ApplicationContext);

  const [show, setShow] = useState<boolean>(false);
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState(``);

  const networkTxRef = useRef<HTMLButtonElement>(null);
  const renderAmount = tokenAmount ? `${formatNumberToCurrency(tokenAmount)} ` : "";

  const renderInfo = {
    Lock: {
      title: "Lock $BEPRO",
      description: "Lock $BEPRO to curate the Network",
      label: `Lock ${renderAmount}$BEPRO`,
      caption: "Get Oracles from $BEPRO",
      body: `You are locking ${tokenAmount} $BEPRO /br/ to get /oracles${tokenAmount} Oracles/`,
      params() {
        return { tokenAmount };
      },
    },
    Unlock: {
      title: "Unlock $BEPRO",
      description: "Unlock $BEPRO And Withdraw",
      label: `Withdraw ${renderAmount}$BEPRO`,
      caption: "Get $BEPRO from Oracles",
      body: `Give away /oracles${tokenAmount} Oracles/ /br/ to get back ${tokenAmount} $BEPRO`,
      params(from: string) {
        return { tokenAmount, from };
      },
    },
  }[action];

  function updateErrorsAndApproval(bool: boolean) {
    setIsApproved(bool);
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
                  BeproService.network
                              .isApprovedSettlerToken({address: currentAddress, amount})
                              .then(updateErrorsAndApproval)
                })
  }

  function onSuccess() {
    BeproService.network.getOraclesSummary({address: currentAddress})
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
    if(params.floatValue < 0)
      return setTokenAmount(0)

    if (params.floatValue > getMaxAmmount())
      setError(`Amount is greater than your ${getCurrentLabel()} amount`)
    else if(error)
      setError("")

    setTokenAmount(params.floatValue);
  }

  function handleConfirm() {
    setShow(false);
    networkTxRef.current.click();
  }

  function handleCancel() {
    setTokenAmount(0);
    setIsApproved(false);
    setShow(false);
    updateValues();
  }

  const isButtonDisabled = (): boolean => [
    tokenAmount < 1,
    !isApproved,
    !currentAddress,
    tokenAmount > getMaxAmmount(),
    myTransactions.find(({status, type}) =>
                          status === TransactionStatus.pending && type === getTxType())
  ].some(values => values)

  function approveSettlerToken() {
    if (!currentAddress)
      return;

    const approveTx = addTransaction({type: TransactionTypes.approveSettlerToken});

    BeproService.network.approveSettlerERC20Token()
                .then((txInfo) => {
                  BeproService.parseTransaction(txInfo, approveTx.payload)
                              .then(block => dispatch(updateTransaction(block)));
                  return txInfo.status
                })
                .then(() => {
                  setIsApproved(true);
                  setError(``);
                })
                .catch(e => {
                  dispatch(updateTransaction({...approveTx.payload as any, remove: true}));
                  console.error(`Failed to approve settler token`, e);
                })
  }

  function checkLockedAmount() {
    if (!currentAddress)
      return;

    BeproService.network
                .isApprovedSettlerToken({address: BeproService.address, amount: tokenAmount})
                .then(handleCheck);
  }

  function getCurrentLabel(): TransactionCurrency {
    return action === `Lock` && `$BEPRO` || `Oracles`
  }

  function getMaxAmmount(): number {
    return action === `Lock` && balance.bepro || (+oracles.tokensLocked - oracles.delegatedToOthers);
  }

  function getTxType() {
    return action === `Lock` && TransactionTypes.lock || TransactionTypes.unlock;
  }

  useEffect(updateWalletAddress, [currentAddress])

  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper h-100">
          <OraclesBoxHeader actions={actions} onChange={setAction} currentAction={action} />

          <p className="p text-white">{renderInfo.description}</p>

          <InputNumber
            disabled={!isApproved || !metaMaskWallet}
            label={`${getCurrentLabel()} Amount`}
            symbol={`${getCurrentLabel().toLocaleUpperCase()}`}
            max={balance.bepro}
            error={error}
            helperText={error}
            value={tokenAmount}
            onValueChange={handleChangeToken}
            thousandSeparator />

          { action === 'Lock' && !isApproved && <ApproveButton disabled={!currentAddress} onClick={approveSettlerToken} /> || ``}
          {isApproved && <TransferOraclesButton buttonLabel={renderInfo.label} disabled={isButtonDisabled()} onClick={checkLockedAmount} />}

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
            ref={networkTxRef} />

        </div>
      </div>



      <Modal
        title={renderInfo.title}
        show={show}
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </>
        }>
        <p className="p-small text-white-50 text-center">
          {renderInfo.caption}
        </p>
        <p className="text-center fs-4">
          {renderInfo.body?.split("/").map((sentence: string) => {
            const Component =
              (sentence.startsWith("oracles") && "span") || Fragment;

            return (
              <Fragment key={sentence}>
                <Component
                  {...(sentence.startsWith("oracles") && {
                    className: "text-bold color-purple",
                  })}>
                  {sentence.replace(/oracles|br/, "")}
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
