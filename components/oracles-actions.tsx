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
import {addTransaction} from '@reducers/add-transaction';
import {updateTransaction} from '@reducers/update-transaction';
import {formatNumberToCurrency} from 'helpers/formatNumber'

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
  const {state: {beproInit, metaMaskWallet, currentAddress, balance, oracles}, dispatch} = useContext(ApplicationContext);

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
    BeproService.getBalance('bepro').then(bepro => dispatch(changeBalance({bepro})));
    BeproService.getBalance('eth').then(eth => dispatch(changeBalance({eth})));
    BeproService.getBalance('staked').then(staked => dispatch(changeBalance({staked})));

    BeproService.network
                .isApprovedSettlerToken({address: BeproService.address, amount: balance.bepro})
                .then(updateErrorsAndApproval);
  }

  function updateWalletAddress() {
    if (!beproInit || !metaMaskWallet)
      return;

    setWalletAddress(BeproService.address);
    updateValues();
  }

  function handleChangeToken(params: NumberFormatValues) {
    if(params.floatValue < 0)
      return setTokenAmount(0)
    
    if (action === 'Lock' && params.floatValue > balance.bepro)
      return setError(`Amount is greater than your BEPRO amount`)
    
    if (action === 'Unlock' && params.floatValue > Number(oracles.tokensLocked))
      return setError(`Amount is greater than your Oracles amount`)

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
                .then(setIsApproved)
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

  function getTxType() {
    return action === `Lock` && TransactionTypes.lock || TransactionTypes.unlock;
  }

  useEffect(() => {
    setError("");
  }, [tokenAmount, action]);

  useEffect(updateWalletAddress, [beproInit, metaMaskWallet, currentAddress])


  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper h-100">
          <OraclesBoxHeader actions={actions} onChange={setAction} currentAction={action} />

          <p className="p text-white">{renderInfo.description}</p>

          <InputNumber
            disabled={!isApproved || !metaMaskWallet}
            label="$BEPRO Amount"
            symbol="$BEPRO"
            max={balance.bepro}
            error={error}
            helperText={error}
            value={tokenAmount}
            onValueChange={handleChangeToken}
            thousandSeparator />

          { action === 'Lock' && <ApproveButton disabled={isApproved || !tokenAmount || !metaMaskWallet} onClick={approveSettlerToken} /> || ``}
          <TransferOraclesButton buttonLabel={renderInfo.label} disabled={!isApproved || !metaMaskWallet} onClick={checkLockedAmount} />

          <NetworkTxButton 
            txMethod={action.toLowerCase()}
            txType={getTxType()}
            txCurrency={action === `Lock` && `$BEPRO` || `Oracles`}
            txParams={renderInfo.params(walletAddress)}
            buttonLabel=""
            modalTitle={renderInfo.title}
            modalDescription={renderInfo.description}
            onSuccess={handleCancel}
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
