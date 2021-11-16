import {ChangeEvent, useContext, useEffect, useState} from 'react';
import {NumberFormatValues} from 'react-number-format';
import InputNumber from './input-number';
import OraclesBoxHeader from './oracles-box-header';
import {ApplicationContext} from '@contexts/application';
import NetworkTxButton from './network-tx-button';
import {changeBalance} from '@reducers/change-balance';
import {BeproService} from '@services/bepro-service';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import { TransactionStatus } from '@interfaces/enums/transaction-status';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import {formatNumberToCurrency} from 'helpers/formatNumber'

function OraclesDelegate(): JSX.Element {
  const {dispatch, state: {oracles, currentAddress, beproInit, metaMaskWallet,myTransactions, balance: {bepro: beproBalance, staked}}} = useContext(ApplicationContext);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [delegatedAmount, setDelegatedAmount] = useState(0);
  const [error, setError] = useState<string>("");

  function handleChangeOracles(params: NumberFormatValues) {
    if(params.floatValue < 1 || !params.floatValue)
      return setTokenAmount(0)

    if (params.floatValue > delegatedAmount)
      setError(`Amount is greater than your total amount`);
    else setError(``);

    setTokenAmount(params.floatValue);
  }

  function setMaxAmmount() {
    return setTokenAmount(delegatedAmount)
  }

  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    if(error) setError(``);
    setDelegatedTo(params.target.value);
  }

  function handleClickVerification() {
    if (!tokenAmount || !delegatedTo) {
      return setError("Please fill all required fields.");
    }
  }

  function handleTransition() {
    handleChangeOracles({floatValue: 0, formattedValue: '0', value: '0',})
    setDelegatedTo("")
    setError("");

    BeproService.network.getBEPROStaked()
                .then(staked => dispatch(changeBalance({staked})))

                BeproService.network.getOraclesSummary({address: currentAddress})
                .then(oracles => {
                  dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles)))
                });
  }

  function updateAmounts() {
    if (!beproInit || !metaMaskWallet)
      return;

    setDelegatedAmount(+oracles.tokensLocked - oracles.delegatedToOthers);
  }

  const isButtonDisabled = (): boolean => [
      tokenAmount < 1,
      tokenAmount > +oracles.tokensLocked,
      !delegatedTo,
      myTransactions.find(({status, type}) =>
                            status === TransactionStatus.pending && type === TransactionTypes.delegateOracles)
    ].some(values => values)

  useEffect(updateAmounts, [beproInit, metaMaskWallet, oracles, beproBalance, staked]);

  return (
    <div className="col-md-5">
      <div className="content-wrapper h-100">
        <OraclesBoxHeader actions="Delegate oracles" available={delegatedAmount} />
        <p className="smallCaption text-white text-uppercase mt-2 mb-3">Delegate Oracles to use them in issues</p>
        <InputNumber
          label="Oracles Ammout"
          value={tokenAmount}
          symbol="ORACLES"
          classSymbol="text-purple"
          onValueChange={handleChangeOracles}
          thousandSeparator
          error={error}
          helperText={(
            <>
              {formatNumberToCurrency(delegatedAmount)} Oracles Available
              <span
                  className="smallCaption ml-1 cursor-pointer text-uppercase text-purple"
                  onClick={setMaxAmmount}
                  >
                  Max
                </span>
            </>)
          }/>

        <div className="form-group mt-2">
          <label className="smallCaption text-uppercase text-white bg-opacity-100 mb-2">Delegation address</label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className="form-control"
            placeholder="Type an address"/>
        </div>

        {error && <p className="p-small text-danger mt-2">{error}</p>}

        <NetworkTxButton
          txMethod="delegateOracles"
          txParams={{tokenAmount, delegatedTo}}
          txType={TransactionTypes.delegateOracles}
          txCurrency="Oracles"
          modalTitle="Delegate oracles"
          modalDescription="Delegate oracles to an address"
          onTxStart={handleClickVerification}
          onSuccess={handleTransition}
          onFail={setError}
          buttonLabel="delegate"
          fullWidth={true}
          disabled={isButtonDisabled()}
          />

      </div>
    </div>
  );
}

export default OraclesDelegate;
