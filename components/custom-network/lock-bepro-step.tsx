import { useContext, useState } from 'react'
import { ProgressBar } from 'react-bootstrap'

import LockedIcon from '@assets/icons/locked-icon'
import ArrowRightLine from '@assets/icons/arrow-right-line'

import Step from '@components/step'
import Button from '@components/button'
import InputNumber from '@components/input-number'
import UnlockBeproModal from '@components/unlock-bepro-modal'

import { ApplicationContext } from '@contexts/application'

import { formatNumberToCurrency } from '@helpers/formatNumber'

import { BeproService } from '@services/bepro-service'

export default function LockBeproStep({
  data,
  step,
  balance,
  currentStep,
  handleChange,
  handleChangeStep
}) {
  const [isLocking, setIsLocking] = useState(false)
  const [showUnlockBepro, setShowUnlockBepro] = useState(false)

  const {
    methods: { updateWalletBalance }
  } = useContext(ApplicationContext)

  const lockedPercent =
    ((data.amountLocked || 0) / (data.amountNeeded || 0)) * 100
  const lockingPercent = ((data.amount || 0) / (data.amountNeeded || 0)) * 100
  const maxPercent = 100 - lockedPercent
  const maxValue = Math.min(
    balance.beproAvailable,
    data.amountNeeded - data.amountLocked
  )
  const textAmountClass =
    data.amount > balance.beproAvailable ? 'text-danger' : 'text-primary'
  const amountsClass = data.amount > maxValue ? 'danger' : 'success'

  function handleLock() {
    setIsLocking(true)

    const amount = data.amount

    BeproService.networkFactory
      .approveSettlerERC20Token()
      .then((result) => {
        BeproService.networkFactory
          .lock(amount)
          .then(() => {
            handleChange({ label: 'amountLocked', value: amount })
            handleChange({ label: 'amount', value: 0 })
            updateWalletBalance()
          })
          .catch(console.log)
          .finally(() => setIsLocking(false))
      })
      .catch(() => setIsLocking(false))
  }

  function handleUnLock() {
    BeproService.networkFactory.unlock().then(console.log).catch(console.log)
  }

  function handleShowUnlockModal() {
    setShowUnlockBepro(true)
  }

  function handleCloseUnlockModal() {
    setShowUnlockBepro(false)
  }

  return (
    <Step
      title="Network "
      index={step}
      activeStep={currentStep}
      validated={data.validated}
      handleClick={handleChangeStep}
    >
      <div className="row mb-4">
        <span className="caption-small text-gray">
          To create a network you will nedd to lock 1M $BEPRO
        </span>
      </div>

      <div className="row mx-0 mb-4">
        <div className="col mr-3">
          <div className="row">
            <div className="col px-0">
              <div className="row mb-2">
                <label htmlFor="" className="caption-medium text-gray">
                  <span className="text-primary">$BEPRO</span> amount
                </label>
              </div>

              <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
                <InputNumber
                  classSymbol={`text-primary`}
                  max={maxValue}
                  value={data.amount}
                  error={data.amount > maxValue}
                  setMaxValue={() =>
                    handleChange({ label: 'amount', value: maxValue })
                  }
                  min={0}
                  placeholder={'0'}
                  thousandSeparator
                  decimalSeparator="."
                  decimalScale={18}
                  onValueChange={(params) =>
                    handleChange({ label: 'amount', value: params.floatValue })
                  }
                />

                <div className="d-flex caption-small justify-content-between align-items-center p-20">
                  <span className="text-ligth-gray">
                    <span className="text-primary">$BEPRO</span> available
                  </span>

                  <div className="d-flex align-items-center">
                    <span className="text-gray">
                      {formatNumberToCurrency(balance.beproAvailable || 0, {
                        maximumFractionDigits: 18
                      })}
                    </span>

                    {data.amount > 0 && (
                      <>
                        <span
                          className={`${textAmountClass} ml-1 d-flex align-items-center`}
                        >
                          <ArrowRightLine />
                        </span>

                        <span className={`${textAmountClass} ml-1`}>
                          {formatNumberToCurrency(
                            parseFloat(balance.beproAvailable) -
                              parseFloat(data.amount)
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {balance.oraclesAvailable > 0 && (
                <>
                  <div className="row mt-4">
                    <p className="caption-small text-gray">
                      unlock <span className="text-primary">$BEPRO</span> by
                      giving away <span className="text-purple">oracles</span>
                    </p>
                  </div>

                  <div
                    className="row mt-2 bg-dark-gray bg-dark-hover cursor-pointer border-radius-8 caption-small p-20"
                    onClick={handleShowUnlockModal}
                  >
                    <div className="d-flex justify-content-between px-0">
                      <span className="text-ligth-gray">
                        <span className="text-purple">ORACLES</span> available
                      </span>

                      <span className="text-gray">
                        {formatNumberToCurrency(balance.oraclesAvailable || 0, {
                          maximumFractionDigits: 18
                        })}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col bg-dark-gray border-radius-8 p-20">
          <p className="caption-medium text-gray mb-4">
            <span className="text-primary">$BEPRO</span> locked
          </p>

          <div className="d-flex justify-content-between caption-large mb-3 amount-input">
            <div className="d-flex align-items-center">
              <span
                className={`text-${
                  (lockedPercent >= 100 && 'success') || 'white'
                } mr-1`}
              >
                {formatNumberToCurrency(data.amountLocked || 0, {
                  maximumFractionDigits: 18
                })}
              </span>

              {data.amount > 0 && (
                <div className={`text-${amountsClass}`}>
                  <ArrowRightLine />

                  <span className="ml-1">
                    {formatNumberToCurrency(
                      parseFloat(data.amountLocked) + parseFloat(data.amount)
                    )}
                  </span>
                </div>
              )}
            </div>

            <span
              className={`text-${
                (lockedPercent >= 100 && 'success') || 'gray'
              }`}
            >
              {(lockedPercent >= 100 && 'full') ||
                formatNumberToCurrency(data.amountNeeded || 0, {
                  maximumFractionDigits: 18
                })}
            </span>
          </div>

          <div className="row justify-content-between caption-large mb-3">
            <ProgressBar>
              <ProgressBar
                variant={amountsClass}
                now={lockingPercent > maxPercent ? 100 : lockedPercent}
                isChild
              />

              <ProgressBar
                min={0}
                now={lockingPercent > maxPercent ? 0 : lockingPercent}
                isChild
              />
            </ProgressBar>
          </div>

          <div className="d-flex align-items-center caption-large text-white amount-input">
            <span
              className={`text-${
                (lockedPercent >= 100 && 'success') || 'white'
              } mr-1`}
            >
              {formatNumberToCurrency(lockedPercent, {
                maximumFractionDigits: 2
              })}
              %
            </span>

            {data.amount > 0 && (
              <div className={`text-${amountsClass}`}>
                <ArrowRightLine />

                <span className="ml-1">
                  {formatNumberToCurrency(lockingPercent + lockedPercent, {
                    maximumFractionDigits: 2
                  })}
                  %
                </span>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4 pt-3">
            <Button
              disabled={
                !(data.amount > 0) ||
                lockedPercent >= 100 ||
                data.amount > maxValue ||
                isLocking
              }
              onClick={() => handleLock()}
            >
              {!isLocking &&
                (!(data.amount > 0) ||
                  lockedPercent >= 100 ||
                  data.amount > maxValue) && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
              <span>lock $bepro</span>
              {isLocking ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ''
              )}
            </Button>

            <Button onClick={handleUnLock}>Unlock</Button>
          </div>
        </div>
      </div>

      <UnlockBeproModal
        show={showUnlockBepro}
        onCloseClick={handleCloseUnlockModal}
      />
    </Step>
  )
}
