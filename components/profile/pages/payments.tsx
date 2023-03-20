import {ChangeEvent, SetStateAction, useEffect, useState} from "react";

import {format, subDays} from "date-fns";
import {useTranslation} from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import NothingFound from "components/nothing-found";
import PaymentsList from "components/profile/payments-list";
import ProfileLayout from "components/profile/profile-layout";
import {FlexColumn, FlexRow} from "components/profile/wallet-balance";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {formatNumberToCurrency} from "helpers/formatNumber";

import {Payment} from "interfaces/payments";

import {getCoinPrice} from "services/coingecko";

import useApi from "x-hooks/use-api";

<<<<<<<< HEAD:pages/[network]/[chain]/profile/payments.tsx
export default function Payments() {
========
export default function PaymentsPage() {
>>>>>>>> 3a5664b7 (introducing new profile structure and profile router):components/profile/pages/payments.tsx
  const { t } = useTranslation(["common", "profile"]);

  const defaultOptions = [
    {
      value: format(subDays(new Date(), 7), "yyyy-MM-dd").toString(),
      label: `7 ${t("info-data.days_other")}`,
    },
    {
      value: format(subDays(new Date(), 15), "yyyy-MM-dd").toString(),
      label: `15 ${t("info-data.days_other")}`,
    },
    {
      value: format(subDays(new Date(), 30), "yyyy-MM-dd").toString(),
      label: `30 ${t("info-data.days_other")}`,
    },
  ];

  const [totalEuro, setTotalEuro] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const {state} = useAppState();

  const { getPayments } = useApi();


  const [option, setOption] = useState<{ value: string; label: string }>(defaultOptions[0]);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd").toString());
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd").toString());

  function onChangeSelect(e: { value: string; label: string }) {
    setStartDate(e.value);
    setEndDate(format(new Date(), "yyyy-MM-dd").toString());
    setOption({
      value: e.value,
      label: e.label,
    });
  }

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.Service?.network?.active?.name) return;

    getPayments(state.currentUser.walletAddress, state.Service?.network?.active.name, startDate, endDate)
      .then(setPayments);
  }, [state.currentUser?.walletAddress, state.Service?.network?.active?.name, startDate, endDate]);

  useEffect(() => {
    if (!payments?.length) return;

    Promise.all(payments.map(async (payment) => ({
        tokenAddress: payment.issue.transactionalToken.address,
        value: payment.ammount,
        price: await getCoinPrice(payment.issue.transactionalToken.symbol, state?.Settings.currency.defaultFiat),
    }))).then((tokens) => {
      const totalConverted = tokens.reduce((acc, token) => acc + token.value * (token.price || 0),
                                           0);
      const noConverted = !!tokens.find((token) => token.price === undefined);

      setTotalEuro(totalConverted);
      setHasNoConvertedToken(noConverted);
    });
  }, [payments]);

  function onChangeDate(e: ChangeEvent<HTMLInputElement>,
                        setState: (value: SetStateAction<string>) => void) {
    setOption({ value: "-", label: "-" });
    setState(e.target.value);
  }

  return (
    <ProfileLayout>
      <FlexColumn className="col-10">
        <FlexRow className="align-items-center justify-content-between gap-2 mb-2">
          <FlexColumn>
            <h4 className="text-white">{t("main-nav.nav-avatar.payments")}</h4>
          </FlexColumn>

          <FlexColumn>
            <FlexRow className="align-items-center">
              {hasNoConvertedToken ? (
                  <span className="caption-small text-danger">
                    {t("currencies.error-convert-all-to-euro")}
                  </span>
                ) : (
                  <>
                    <span className="caption-medium text-white mr-2">
                      {t("labels.recivedintotal")}
                    </span>
                    <div className="caption-large bg-dark-gray py-2 px-3 border-radius-8">
                      <span className="text-white">
                        {formatNumberToCurrency(totalEuro)}
                      </span>

                      <span className="text-gray ml-1">{t("currencies.euro")}</span>
                    </div>
                  </>
                )}
            </FlexRow>
          </FlexColumn>
        </FlexRow>

        <FlexRow className="align-items-center gap-2 mb-4">
          <FlexColumn className="col-auto">
            <FlexRow className="align-items-center justify-content-between gap-1">
              <label className="text-uppercase caption-small">
                {t("misc.latest")}
              </label>
              <ReactSelect
                options={defaultOptions}
                value={option}
                onChange={onChangeSelect}
              />
            </FlexRow>
          </FlexColumn>

          <label className="text-uppercase caption-small">
            {t("profile:payments.period")}
          </label>

          <input
            type="date"
            key="startDate"
            className="form-control"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeDate(e, setStartDate)
            }
            value={startDate}
            max={endDate}
          />
          <span>
            <ArrowRight height="10px" width="10px" />
          </span>

          <input
            type="date"
            key="endDate"
            className="form-control"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChangeDate(e, setEndDate)
            }
            value={endDate}
            max={format(new Date(), "yyyy-MM-dd").toString()}
          />
        </FlexRow>

        <FlexRow className="justify-content-center">
          <FlexColumn>
            {payments?.length > 0 ? (
              <PaymentsList payments={payments} />
            ) : (
              <NothingFound description={t("filters.no-records-found")} />
            )}
          </FlexColumn>
        </FlexRow>
      </FlexColumn>
    </ProfileLayout>
  );
}