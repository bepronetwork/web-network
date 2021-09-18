import {ChangeEvent, useContext, useEffect, useState} from 'react';
import {NumberFormatValues} from 'react-number-format';
import InputNumber from './input-number';
import OraclesBoxHeader from './oracles-box-header';
import {ApplicationContext} from '@contexts/application';
import NetworkTxButton from './network-tx-button';
import {changeBalance} from '@reducers/change-balance';
import {BeproService} from '@services/bepro-service';
import {TransactionTypes} from '@interfaces/enums/transaction-types';

function OraclesDelegate(): JSX.Element {
  const {dispatch, state: {oracles, beproInit, metaMaskWallet, balance: {bepro: beproBalance, staked}}} = useContext(ApplicationContext);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [delegatedAmount, setDelegatedAmount] = useState(0);
  const [error, setError] = useState<string>("");

  function handleChangeOracles(params: NumberFormatValues) {
    if (params.floatValue > delegatedAmount)
      setError(`Amount is greater than your total amount`);
    else setError(``);

    setTokenAmount(params.floatValue);
  }

  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    setDelegatedTo(params.target.value);
  }

  function handleClickVerification() {
    if (!tokenAmount || !delegatedTo) {
      return setError("Please fill all required fields.");
    }
  }

  function handleTransition() {
    setError("");
    BeproService.network.getBEPROStaked().then(staked => dispatch(changeBalance({staked})));
  }

  function updateAmounts() {
    if (!beproInit || !metaMaskWallet)
      return;

    setDelegatedAmount(
      oracles.amounts.reduce((total, current) => total += +current, 0)
    )

  }

  useEffect(updateAmounts, [beproInit, metaMaskWallet, oracles, beproBalance, staked]);

  return (
    <div className="col-md-5">
      <div className="content-wrapper h-100">
        <OraclesBoxHeader actions="Delegate oracles" available={delegatedAmount} />
        <InputNumber
          label="Oracles Ammout"
          value={tokenAmount}
          onValueChange={handleChangeOracles}
          thousandSeparator
        />
        <div className="form-group">
          <label className="p-small trans mb-2">Delegation address</label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className="form-control"
            placeholder="Type an address"
          />
        </div>
        {error && <p className="p-small text-danger mt-2">{error}</p>}

        <NetworkTxButton txMethod="delegateOracles"
                         txParams={{tokenAmount, delegatedTo}}
                         txType={TransactionTypes.delegateOracles}
                         txCurrency="Oracles"
                         modalTitle="Delegate oracles"
                         modalDescription="Delegate oracles to an address"
                         onTxStart={handleClickVerification}
                         onSuccess={handleTransition}
                         fullWidth={true}
                         disabled={!delegatedTo || tokenAmount > +oracles.tokensLocked }
                         onFail={setError} buttonLabel="delegate" />
      </div>
    </div>
  );
}

export default OraclesDelegate;
