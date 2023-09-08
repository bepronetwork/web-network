import { FormControl, InputGroup } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import SelectNetwork from "components/bounties/select-network";
import { FlexColumn, FlexRow } from "components/common/flex-box/view";
import If from "components/If";
import InfoTooltip from "components/info-tooltip";
import IssueMobileFilters from "components/issue-filters/mobile-filters";
import ChainSelector from "components/navigation/chain-selector/controller";
import NothingFound from "components/nothing-found";
import { TokenBalanceType } from "components/profile/token-balance";
import ResponsiveWrapper from "components/responsive-wrapper";
import TokenIcon from "components/token-icon";

import { formatStringToCurrency } from "helpers/formatNumber";

import { TokensOracles } from "interfaces/oracles-state";

import NetworkItem from "../../../network-item/controller";

interface WalletBalanceViewProps {
  totalAmount: string;
  isOnNetwork: boolean;
  hasNoConvertedToken: boolean;
  defaultFiat: string;
  tokens: TokenBalanceType[];
  tokensOracles: TokensOracles[];
  searchString: string;
  handleNetworkLink?: (token: TokensOracles) => void;
  onSearchClick: () => void;
  onSearchInputChange: (event) => void;
  onEnterPressed: (event) => void;
  onClearSearch: () => void;
}

export default function WalletBalanceView({
  totalAmount,
  isOnNetwork,
  hasNoConvertedToken,
  defaultFiat,
  tokens,
  tokensOracles,
  searchString,
  onSearchClick,
  onSearchInputChange,
  handleNetworkLink,
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
            <IssueMobileFilters onlyProfileFilters={true} hideSort showChainSelector/>
          </ResponsiveWrapper>
          <ResponsiveWrapper xs={false} md={true}>
            <div className="d-flex align-items-center me-3">
              <label className="caption-small font-weight-medium text-gray-100 text-nowrap mr-1">
                {t("misc.chain")}
              </label>
              <ChainSelector />
            </div>
            <SelectNetwork isCurrentDefault={isOnNetwork} filterByConnectedChain/>
          </ResponsiveWrapper>
        </div>
      </div>

      <FlexRow>
        <span className="h4 family-Regular text-white font-weight-medium mb-2">
          {t("profile:tokens")}
        </span>
      </FlexRow>
      <FlexRow className="d-flex flex-wrap justify-content-between align-items-center mb-2">
        <span className="text-white mt-2">{t("labels.recivedintotal")}</span>
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
        {tokens?.map((token) => (
          <NetworkItem
            key={`balance-${token?.address}`}
            type="voting"
            iconNetwork={token?.icon}
            networkName={token?.name}
            amount={token?.balance?.toString()}
            symbol={token?.symbol}
          />
        ))}
      </If>

      <FlexRow className="mt-3 mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-medium">
          {t("main-nav.nav-avatar.voting-power")}
        </span>
      </FlexRow>

      <If
        condition={tokensOracles?.length > 0}
        otherwise={
          tokensOracles && (
            <div className="pt-4">
              <NothingFound description={t("profile:not-found.voting-power")} />
            </div>
          )
        }
      >
        {tokensOracles?.map((token, key) => (
          <NetworkItem
            key={`voting-${token?.address}-${key}`}
            type="voting"
            iconNetwork={token?.icon ? token?.icon : <TokenIcon />}
            networkName={token?.name}
            subNetworkText={token?.networkName}
            handleNetworkLink={
              isOnNetwork ? null : () => handleNetworkLink(token)
            }
            amount={token?.oraclesLocked?.toFixed()}
            symbol={token?.symbol}
          />
        ))}
      </If>
    </FlexColumn>
  );
}
