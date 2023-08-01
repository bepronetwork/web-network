import { useTranslation } from "next-i18next";

import { FlexColumn, FlexRow } from "components/common/flex-box/view";
import If from "components/If";
import ChainFilter from "components/lists/filters/chain/controller";
import IntervalFilters from "components/lists/filters/interval/controller";
import PaymentsList from "components/lists/payments/controller";
import PaymentsListMobileFilters from "components/lists/payments/mobile-filters/controller";
import NothingFound from "components/nothing-found";
import ProfileLayout from "components/profile/profile-layout";
import ResponsiveWrapper from "components/responsive-wrapper";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { PaymentsPageProps } from "types/pages";
import { TotalFiatNetworks } from "types/utils";

interface PaymentsMultiViewProps extends PaymentsPageProps {
  fiatSymbol: string;
  totalFiat: number;
  intervals: number[];
  defaultInterval: number;
  totalFiatNetworks: TotalFiatNetworks[];
  hasNoConvertedToken?: boolean;
}

export default function PaymentsMultiView({
  payments,
  chains,
  fiatSymbol,
  totalFiat,
  intervals,
  defaultInterval,
  totalFiatNetworks,
  hasNoConvertedToken,
}: PaymentsMultiViewProps) {
  const { t } = useTranslation(["common", "profile", "custom-network"]);

  function TotalReceived() {
    if (hasNoConvertedToken)
      return(
        <span className="caption-small text-danger">
          {t("currencies.error-convert-all-to-fiat", { fiat: fiatSymbol })}
        </span>
      );

    return(
      <>
        <span className="caption-medium font-weight-normal text-capitalize text-white mr-2">
          {t("labels.recivedintotal")}
        </span>

        <div className="caption-large font-weight-medium bg-gray-900 py-2 px-3 border border-gray-850 border-radius-4">
          <span className="text-white">
            {formatNumberToCurrency(totalFiat)}
          </span>

          <span className="text-gray-600 ml-1">{fiatSymbol}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <ResponsiveWrapper
        xs={true}
        xl={false}
        className={`align-items-center justify-content-between mb-2 border-bottom 
        border-gray-850 border-xl-0 pb-3 px-3 mt-2`}
      >
        <FlexColumn>
          <h4 className="text-white font-weight-medium">{t("main-nav.nav-avatar.payments")}</h4>
        </FlexColumn>

        <ResponsiveWrapper xs={false} lg={true}>
          <FlexRow className="align-items-center">
            <TotalReceived />
          </FlexRow>
        </ResponsiveWrapper>

        <ResponsiveWrapper xs={true} lg={false}>
          <PaymentsListMobileFilters
            defaultInterval={defaultInterval}
            intervals={intervals}
            chains={chains}
          />
        </ResponsiveWrapper>
      </ResponsiveWrapper>

      <ProfileLayout>
        <div className="col-12">
          <ResponsiveWrapper 
            xs={false}
            xl={true}
            className={`align-items-center justify-content-between mb-2 border-bottom 
            border-gray-850 border-xl-0 pb-3`}
          >
            <FlexColumn>
              <h3 className="text-white font-weight-medium">{t("main-nav.nav-avatar.payments")}</h3>
            </FlexColumn>

            <ResponsiveWrapper xs={false} md={true}>
              <FlexRow className="align-items-center">
                <TotalReceived />
              </FlexRow>
            </ResponsiveWrapper>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={true} lg={false}>
            <FlexRow className="align-items-center justify-content-between w-100 mb-3">
              <TotalReceived />
            </FlexRow>
          </ResponsiveWrapper>

          <ResponsiveWrapper
            xs={false}
            lg={true}
            className="row align-items-center mb-4"
          >
            <div className="col">
              <IntervalFilters
                defaultInterval={defaultInterval}
                intervals={intervals}
              />
            </div>

            <div className="col-3">
              <ChainFilter
                chains={chains}
              />
            </div>
          </ResponsiveWrapper>

          <FlexRow className="justify-content-center">
            <FlexColumn className="col-12">
              <If
                condition={!!payments?.length}
                otherwise={
                  <NothingFound description={t("filters.no-records-found")} />
                }
              >
                <PaymentsList
                  payments={payments}
                  totalNetworks={totalFiatNetworks}
                  symbol={fiatSymbol}
                />
              </If>
            </FlexColumn>
          </FlexRow>
        </div>
      </ProfileLayout>
    </>
  );
}