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
import { useTranslation } from 'next-i18next';

function OraclesDelegate(): JSX.Element {
  const {dispatch, state: {oracles, currentAddress, beproInit, metaMaskWallet,myTransactions, balance: {bepro: beproBalance, staked}}} = useContext(ApplicationContext);
  const [tokenAmount, setTokenAmount] = useState<number | undefined>();
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [delegatedAmount, setDelegatedAmount] = useState(0);
  const [error, setError] = useState<string>("");
  const { t } = useTranslation(['common', 'my-oracles'])

  function handleChangeOracles(params: NumberFormatValues) {
    if (params.value === '')
      return setTokenAmount(undefined)

    if(params.floatValue < 1 || !params.floatValue)
      return setTokenAmount(0)

    if (params.floatValue > delegatedAmount)
      setError(t('my-oracles:errors.amount-greater', { amount: 'total' }));
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
      return setError(t('my-oracles:errors.fill-required-fields'));
    }
  }

  function handleTransition() {
    handleChangeOracles({floatValue: 0, formattedValue: '0', value: '0',})
    setDelegatedTo("")
    setError("");

    BeproService.network.getBEPROStaked()
                .then(staked => dispatch(changeBalance({staked})))

                BeproService.network.getOraclesSummary(currentAddress)
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
      isAddressesEqual(),
      myTransactions.find(({status, type}) =>
                            status === TransactionStatus.pending && type === TransactionTypes.delegateOracles)
    ].some(values => values)

  const isAddressesEqual = () => currentAddress && delegatedTo?.toLowerCase() === currentAddress?.toLowerCase()

  useEffect(updateAmounts, [beproInit, metaMaskWallet, oracles, beproBalance, staked]);

  return (
    <div className="col-md-5">
      <div className="content-wrapper h-100">
        <OraclesBoxHeader actions={t('my-oracles:actions.delegate.title')} available={delegatedAmount} />
        <p className="caption-small text-white text-uppercase mt-2 mb-3">{t('my-oracles:actions.delegate.description')}</p>
        <InputNumber
          label={t('my-oracles:fields.oracles.label')}
          value={tokenAmount}
          symbol={t('$oracles')}
          classSymbol="text-purple"
          onValueChange={handleChangeOracles}
          min={0}
          placeholder={t('my-oracles:fields.oracles.placeholder')}
          thousandSeparator
          error={!!error}
          helperText={(
            <>
              {formatNumberToCurrency(delegatedAmount, { maximumFractionDigits: 18 })} {`${t('$oracles')} ${t('my-oracles:available')}`}
              <span
                  className="caption-small ml-1 cursor-pointer text-uppercase text-purple"
                  onClick={setMaxAmmount}
                  >
                  {t('misc.max')}
              </span>
              {error && <p className="p-small my-2">{error}</p>}
            </>)
          }/>

        <div className="form-group mt-2">
          <label className="caption-small text-uppercase text-white bg-opacity-100 mb-2">{t('my-oracles:fields.address.label')}</label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className={`form-control ${isAddressesEqual() && 'is-invalid' || ''}`}
            placeholder={t('my-oracles:fields.address.placeholder')}
            />
            {isAddressesEqual() && <small className="text-danger text-italic">{t('my-oracles:errors.self-delegate')}</small> || ''}
        </div>

        {error && <p className="p-small text-danger mt-2">{error}</p>}

        <NetworkTxButton
          txMethod="delegateOracles"
          txParams={{tokenAmount, delegatedTo}}
          txType={TransactionTypes.delegateOracles}
          txCurrency={t('$oracles')}
          modalTitle={t('my-oracles:actions.delegate.title')}
          modalDescription={t('my-oracles:actions.delegate.delegate-to-address')}
          onTxStart={handleClickVerification}
          onSuccess={handleTransition}
          onFail={setError}
          buttonLabel={t('my-oracles:actions.delegate.label')}
          fullWidth={true}
          disabled={isButtonDisabled()}
          />

      </div>
    </div>
  );
}

export default OraclesDelegate;
