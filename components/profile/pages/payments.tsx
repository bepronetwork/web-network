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

import { Network } from "interfaces/network";
import {Payment} from "interfaces/payments";

import {getCoinPrice} from "services/coingecko";

import useApi from "x-hooks/use-api";

export interface TotalFiatNetworks {
  tokenAddress: string;
  value: number;
  price: number;
  networkId: number;
}

export default function PaymentsPage() {
  const { t } = useTranslation(["common", "profile", "custom-network"]);

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

  const [totalFiat, setTotalFiat] = useState(0);
  const [totalFiatNetworks, setTotalFiatNetworks] = useState<TotalFiatNetworks[]>([])
  const [payments, setPayments] = useState<Payment[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
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
    if (!state.currentUser?.walletAddress) return;

    getPayments(state.currentUser.walletAddress, startDate, endDate).then(setPayments);
  }, [state.currentUser?.walletAddress, startDate, endDate]);

  useEffect(() => {
    if (!payments) return;
    const allNetworks: Network[] = [];
    payments.map((payment) => {
      if (
        !networks.find((network) => network?.id === payment?.issue?.network?.id) &&
        !allNetworks.find((network) => network?.id === payment?.issue?.network?.id)
      ) {
        allNetworks.push(payment?.issue?.network);
        setNetworks(allNetworks);
      }
    });
  }, [payments]);

  useEffect(() => {
    if (!payments?.length) return;

    Promise.all(payments.map(async (payment) => ({
        tokenAddress: payment?.issue?.transactionalToken?.address,
        value: payment.ammount,
        price: await getCoinPrice(payment?.issue?.transactionalToken?.symbol, state?.Settings.currency.defaultFiat),
        networkId: payment?.issue?.network_id
    }))).then((tokens) => {
      const totalConverted = tokens.reduce((acc, token) => acc + token.value * (token.price || 0),
                                           0);
      const noConverted = !!tokens.find((token) => token.price === undefined);
      
      setTotalFiatNetworks(tokens)
      setTotalFiat(totalConverted);
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
                        {formatNumberToCurrency(totalFiat)}
                      </span>

                      <span className="text-gray ml-1">{state?.Settings?.currency?.defaultFiat}</span>
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
          <FlexColumn className="col-12">
            {networks?.length > 0 ? (
              <PaymentsList
                payments={payments}
                networks={networks}
                totalNetworks={totalFiatNetworks}
                symbol={state?.Settings?.currency?.defaultFiat?.toUpperCase()}
              />
            ) : (
              <NothingFound description={t("filters.no-records-found")} />
            )}
          </FlexColumn>
        </FlexRow>
      </FlexColumn>
    </ProfileLayout>
  );
}
