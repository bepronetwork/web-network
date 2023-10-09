import {  useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";

import { TokenBalanceType } from "components/profile/token-balance";
import TokenIcon from "components/token-icon";

import { useAppState } from "contexts/app-state";

import { getPricesAndConvert } from "helpers/tokens";


import { TokensOracles } from "interfaces/oracles-state";
import { Token } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";
import DAO from "services/dao-service";

import { useSearchCurators } from "x-hooks/api/curator";
import { useGetTokens } from "x-hooks/api/token";
import { useNetwork } from "x-hooks/use-network";
import useReactQuery from "x-hooks/use-react-query";

import WalletBalanceView from "./view";

export default function WalletBalance() {
  const { t } = useTranslation(["common", "profile"]);

  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const debouncedSearchUpdater = useDebouncedCallback((value) => setSearch(value), 500);

  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { query, push, pathname, asPath } = useRouter();

  const getAddress = (token: string | Token) =>
    typeof token === "string" ? token : token?.address;

  async function processToken(token: string | Token, service: DAO) {
    const [tokenData, balance] = await Promise.all([
      typeof token === "string"
        ? service.getERC20TokenData(token)
        : token,
      service.getTokenBalance(getAddress(token),
                              state?.currentUser?.walletAddress),
    ]);
    const tokenInformation = await getCoinInfoByContract(tokenData?.symbol);

    return {
      balance,
      ...tokenData,
      icon: <TokenIcon src={tokenInformation?.icon as string} />,
    };
  }

  function updateSearch() {
    setSearch(searchState);
  }

  function handleSearch(event) {
    if (event.key !== "Enter") return;

    updateSearch();
  }

  function handleClearSearch(): void {
    setSearchState("");
    setSearch("");
  }

  function handleSearchChange(e) {
    setSearchState(e.target.value);
    debouncedSearchUpdater(e.target.value);
  }

  function handleSearchFilter(name = "", symbol = "", networks) {
    const hasNetworkName = query?.networkName
    const isNetwork = !!networks.find(({ name }) =>
      hasNetworkName?.toString().toLowerCase() === name?.toLowerCase());

    return (
      (name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
        symbol.toLowerCase().indexOf(search.toLowerCase()) >= 0) &&
      (hasNetworkName ? isNetwork : true)
    );
  }

  function loadOracleBalance(): Promise<TokensOracles[]> {
    return useSearchCurators({
      address: state.currentUser?.walletAddress,
      chainShortName:
        query?.chain?.toString() || state?.connectedChain?.shortName,
    }).then(({ rows }) => {
      return Promise.all(rows?.map(async (curator) => {
        const tokenInformation = await getCoinInfoByContract(curator?.network?.networkToken?.symbol);

        return {
            symbol: t("$oracles", {
              token: curator?.network?.networkToken?.symbol,
            }),
            name: `${t("misc.locked")} ${curator?.network?.networkToken?.name}`,
            address: curator?.network?.networkToken?.address,
            icon: <TokenIcon src={tokenInformation?.icon as string} />,
            oraclesLocked: BigNumber(curator.tokensLocked),
            networkName: curator?.network?.name,
        };
      }));
    });
  }

  function loadDaoService(chainRpc: string) {
    const daoService: DAO = new DAO({
      web3Host: chainRpc,
      skipWindowAssignment: true,
    })
  
    daoService.start()

    return daoService
  }

  function loadTokensBalance(): Promise<TokenBalanceType[]> {
    return useGetTokens()
      .then(async (tokens) => {
        const chains = state.supportedChains.map(({ chainRpc, chainId }) => ({
          web3Connection: loadDaoService(chainRpc),
          chainId 
        }))

        return Promise.all(tokens?.map(async (token) => {
          const chain = chains.find(({ chainId }) => chainId === token.chain_id)
          const tokenData = await processToken(token?.address, chain.web3Connection);
          return { networks: token?.networks, ...tokenData };
        }));
      });
  }

  const { data: tokensOracles } = useReactQuery(["voting-power-wallet", state.currentUser?.walletAddress],
                                                loadOracleBalance,
                                                { enabled: !!state.currentUser?.walletAddress });

  const { data: tokens } = useReactQuery( ["tokens-balance", state.currentUser?.walletAddress],
                                          loadTokensBalance,
                                          {
                                            enabled:  !!state.currentUser?.walletAddress && 
                                                      !!state.supportedChains
                                          });

  useEffect(() => {
    if (!tokens?.length) return;

    const convertableItems = tokens.map((token) => ({
      tokenAddress: token.address,
      value:
        typeof token.balance === "string"
          ? BigNumber(token.balance)
          : token.balance,
      token: token
    }))

    getPricesAndConvert(convertableItems, state?.Settings?.currency?.defaultFiat)
    .then(({ noConverted, totalConverted }) => {  
      const totalTokens = tokens.reduce((acc, token) => BigNumber(token.balance).plus(acc),
                                        BigNumber(0));          
      setTotalAmount(noConverted.length > 0 ? totalTokens.toFixed() : totalConverted.toFixed());
      setHasNoConvertedToken(!!noConverted.length);
    })
  }, [tokens]);

  useEffect(() => {
    if(!query?.networkName && query?.network){
      const newQuery = {
        ...query,
        networkName: query?.network
      };
      push({ pathname: pathname, query: newQuery }, asPath);
    }
  }, [query?.network]);

  return (
    <WalletBalanceView
      totalAmount={totalAmount}
      isOnNetwork={!!query?.network}
      hasNoConvertedToken={hasNoConvertedToken}
      defaultFiat={state?.Settings?.currency?.defaultFiat}
      tokens={tokens?.filter(({ name, symbol, networks }) =>
        handleSearchFilter(name, symbol, networks))}
      tokensOracles={tokensOracles?.filter(({ name, symbol, networkName }) =>
        handleSearchFilter(name, symbol, [{ name: networkName }]))}
      handleNetworkLink={(token: TokensOracles) => {
        push(getURLWithNetwork("/", {
            chain: state?.connectedChain?.shortName,
            network: token?.networkName,
        }));
      }}
      searchString={searchState}
      onSearchClick={updateSearch}
      onSearchInputChange={handleSearchChange}
      onEnterPressed={handleSearch}
      onClearSearch={handleClearSearch}
    />
  );
}
