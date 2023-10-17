import {  useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";

import { TokenBalanceType } from "components/profile/token-balance";
import TokenIcon from "components/token-icon";

import { useAppState } from "contexts/app-state";

import { MINUTE_IN_MS } from "helpers/constants";

import { SupportedChainData } from "interfaces/supported-chain-data";
import { Token } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";
import DAO from "services/dao-service";

import useReactQuery from "x-hooks/use-react-query";

import WalletBalanceView from "./view";
interface WalletBalanceProps {
  chains: SupportedChainData[];
  tokens: Token[];
}

export default function WalletBalance({
  chains,
  tokens
}: WalletBalanceProps) {
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);
  const [tokensWithBalance, setTokensWithBalance] = useState(tokens.map(toTokenWithBalance));

  const debouncedSearchUpdater = useDebouncedCallback((value) => setSearch(value), 500);

  const { state } = useAppState();
  const { query, push, pathname, asPath } = useRouter();

  const defaultFiat = state?.Settings?.currency?.defaultFiat;

  function toTokenWithBalance(token) {
    return {
      ...token,
      balance: token?.balance || BigNumber(0),
      icon: token?.icon || <TokenIcon src={null} />
    };
  }

  const getAddress = (token: string | Token) =>
    typeof token === "string" ? token : token?.address;

  async function processToken(token: Token, service: DAO) {
    const [tokenInformation, balance] = await Promise.all([
      getCoinInfoByContract(token?.symbol)
        .catch(() => ({ prices: {}, icon: null })),
      service
        .getTokenBalance(getAddress(token), state?.currentUser?.walletAddress)
        .catch(() => BigNumber(0)),
    ]);

    return {
      ...token,
      balance,
      price: tokenInformation?.prices?.[defaultFiat] || null,
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

  function handleSearchFilter(name = "", symbol = "", networks, chainId) {
    const hasNetworkName = query?.networkName;
    const isNetwork = !!networks.find(({ name }) =>
        hasNetworkName?.toString().toLowerCase() === name?.toLowerCase());
    const hasChainName = query?.networkChain;
    const isChain = !!chains.find((chain) =>
        chain.chainId === chainId &&
        hasChainName?.toString().toLowerCase() ===
          chain.chainShortName.toLowerCase());

    return (
      (name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
        symbol.toLowerCase().indexOf(search.toLowerCase()) >= 0) &&
      (hasNetworkName ? isNetwork : true) &&
      (hasChainName ? isChain : true)
    );
  }

  function loadDaoService(chainRpc: string) {
    const daoService: DAO = new DAO({
      web3Host: chainRpc,
      skipWindowAssignment: true,
    })
  
    daoService.start()

    return daoService
  }

  function loadTokensBalance(): Promise<(TokenBalanceType & { price?: number })[]> {
    const currentChains = chains.map(({ chainRpc, chainId }) => ({
      web3Connection: loadDaoService(chainRpc),
      chainId 
    }))

    return Promise.all(tokens?.map(async (token) => {
      const chain = currentChains.find(({ chainId }) => chainId === token.chain_id);
      const tokenData = await processToken(token, chain.web3Connection);
      return {
        ...tokenData,
        networks: token?.networks,
        chain_id: token.chain_id,
      };
    }));
  }

  const { data: tokensData, isLoading, isSuccess } = 
    useReactQuery(["tokens-balance", state.currentUser?.walletAddress],
                  loadTokensBalance,
                  {
                    enabled: !!state.currentUser?.walletAddress && !!state.supportedChains,
                    staleTime: MINUTE_IN_MS
                  });

  useEffect(() => {
    if (!isLoading && isSuccess) {
      const filteredTokens = tokensData
        .map(token => toTokenWithBalance(token))
        .filter(({ name, symbol, networks, chain_id }) => handleSearchFilter(name, symbol, networks, chain_id))
      setTokensWithBalance(filteredTokens);
      const hasNoConverted = filteredTokens.some(token => !token?.price);
      setHasNoConvertedToken(hasNoConverted);
      const total = hasNoConverted ? 
        filteredTokens.reduce((acc, token) => BigNumber(token.balance).plus(acc), BigNumber(0)) :
        filteredTokens.reduce((acc, token) => 
          BigNumber(token.balance).multipliedBy(token.price).plus(acc), BigNumber(0));
      setTotalAmount(total.toFixed());
    }
  }, [tokensData, query?.networkName, query?.networkChain]);

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
      tokens={tokensWithBalance}
      searchString={searchState}
      onSearchClick={updateSearch}
      onSearchInputChange={handleSearchChange}
      onEnterPressed={handleSearch}
      onClearSearch={handleClearSearch}
      chains={chains}
    />
  );
}
