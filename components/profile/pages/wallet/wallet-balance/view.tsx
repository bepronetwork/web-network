import { FormControl, InputGroup } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import SelectNetwork from "components/bounties/select-network";
import { FlexColumn, FlexRow } from "components/common/flex-box/view";
import If from "components/If";
import InfoTooltip from "components/info-tooltip";
import IssueMobileFilters from "components/issue-filters/mobile-filters";
import ChainFilter from "components/lists/filters/chain/controller";
import NothingFound from "components/nothing-found";
import { TokenBalanceType } from "components/profile/token-balance";
import ResponsiveWrapper from "components/responsive-wrapper";

import { formatStringToCurrency } from "helpers/formatNumber";

import { SupportedChainData } from "interfaces/supported-chain-data";

import NetworkItem from "../../../network-item/controller";

interface WalletBalanceViewProps {
  totalAmount: string;
  isOnNetwork: boolean;
  hasNoConvertedToken: boolean;
  defaultFiat: string;
  tokens: TokenBalanceType[];
  searchString: string;
  onSearchClick: () => void;
  onSearchInputChange: (event) => void;
  onEnterPressed: (event) => void;
  onClearSearch: () => void;
  chains: SupportedChainData[]
}

export default function WalletBalanceView({
  totalAmount,
  isOnNetwork,
  hasNoConvertedToken,
  defaultFiat,
  tokens,
  chains,
  searchString,
  onSearchClick,
  onSearchInputChange,
  onEnterPressed,
  onClearSearch,
}: WalletBalanceViewProps) {
  const { t } = useTranslation(["common", "profile"]);
  const showClearButton = searchString?.trim() !== "";

  return (
    <FlexColumn>
      <FlexRow className="justify-content-start align-items-center mb-4">
        <span className="h3 family-Regular text-white font-weight-medium">
          {t("profile:wallet")}
        </span>
      </FlexRow>

      <div className={"row align-items-center list-actions sticky-top bg-body"}>
        <div className="col">
          <InputGroup className="border-radius-8">
            <InputGroup.Text className="cursor-pointer" onClick={onSearchClick}>
              <SearchIcon />
            </InputGroup.Text>

            <FormControl
              value={searchString}
              onChange={onSearchInputChange}
              className="p-2"
              placeholder={t("profile:search-wallet")}
              onKeyDown={onEnterPressed}
            />

            <If condition={showClearButton}>
              <button
                className="btn bg-gray-900 border-0 py-0 px-3"
                onClick={onClearSearch}
              >
                <CloseIcon width={10} height={10} />
              </button>
            </If>
          </InputGroup>
        </div>
        <div className="col-auto">
          <ResponsiveWrapper xs={true} md={false}>
            <IssueMobileFilters chainOptions={chains} onlyProfileFilters={true} hideSort />
          </ResponsiveWrapper>
          <ResponsiveWrapper xs={false} md={true}>
            <div className="d-flex align-items-center me-3">
              <label className="caption-small font-weight-medium text-gray-100 text-nowrap mr-1">
                {t("misc.chain")}
              </label>
              <ChainFilter
                chains={chains}
                label={false}
              />
            </div>
            <SelectNetwork isCurrentDefault={isOnNetwork} filterByConnectedChain={isOnNetwork ? true : false} />
          </ResponsiveWrapper>
        </div>
      </div>

      <FlexRow>
        <span className="h4 family-Regular text-white font-weight-medium mb-2">
          {t("profile:tokens")}
        </span>
      </FlexRow>
      <FlexRow className="d-flex flex-wrap justify-content-between align-items-center mb-2">
        <span className="text-white mt-2">{t("profile:balances-transactional-tokens")}</span>
        <div className="d-flex mt-2 caption-medium text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
          {formatStringToCurrency(totalAmount)}
          <span className="text-white-30 ml-1 mr-2">
            {!hasNoConvertedToken ? defaultFiat : t("misc.token_other")}
          </span>
          <ResponsiveWrapper
            className="d-flex align-items-center"
            xs={false}
            sm={false}
            md={true}
            xl={true}
          >
            <InfoTooltip
              description={t("profile:tips.total-balance")}
              secondaryIcon
            />
          </ResponsiveWrapper>
        </div>
      </FlexRow>
      <If
        condition={tokens?.length > 0}
        otherwise={
          tokens && (
            <div className="pt-4">
              <NothingFound description={t("profile:not-found.tokens")} />
            </div>
          )
        }
      >
        {tokens?.map((token, key) => (
          <NetworkItem
            key={`balance-${key}-${token?.address}`}
            type="voting"
            iconNetwork={token?.icon}
            networkName={token?.name}
            amount={token?.balance?.toString()}
            symbol={token?.symbol}
          />
        ))}
      </If>
    </FlexColumn>
  );
}
