import { useCallback, useEffect, useState, useContext } from "react";
import { setDefaults } from "react-i18next";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import BigNumber from "bignumber.js";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import useBepro from "x-hooks/use-bepro";

import {addTx, updateTx} from "../contexts/reducers/change-tx-list";
import {MetamaskErrors} from "../interfaces/enums/Errors";
import useTransactions from "x-hooks/useTransactions";

export default function useERC20() {
  const [name, setName] = useState<string>();
  const [decimals, setDecimals] = useState(18);
  const [symbol, setSymbol] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState(BigNumber(0));
  const [loadError, setLoadError] = useState<boolean>();
  const [allowance, setAllowance] = useState(BigNumber(0));
  const [totalSupply, setTotalSupply] = useState(BigNumber(0));

  const txWindow = useTransactions();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { handleApproveToken } = useBepro();
  const { activeNetwork } = useNetwork();
  const { dispatch } = useContext(ApplicationContext);

  const logData = { 
    wallet: wallet?.address, 
    token: address, 
    network: DAOService?.network?.contractAddress 
  };

  const updateAllowanceAndBalance = useCallback(() => {
    if (!wallet?.address || !DAOService?.network?.contractAddress || !address) return;

    DAOService.getTokenBalance(address, wallet.address)
      .then(setBalance)
      .catch(error => console.debug("useERC20:getTokenBalance", logData, error));

    DAOService.getAllowance(address, wallet.address, DAOService.network.contractAddress)
      .then(setAllowance)
      .catch(error => console.debug("useERC20:getAllowance", logData, error));
  }, [wallet?.address, DAOService, address]);

  const approve = useCallback((amount: string) => {
    if (!wallet?.address || !DAOService || !address || !amount) return;

    return handleApproveToken(address, amount).then(updateAllowanceAndBalance);
  }, [wallet?.address, DAOService, address]);

  function setDefaults() {
    setName("");
    setSymbol("");
    setDecimals(18);
    setTotalSupply(BigNumber(0));
    setBalance(BigNumber(0));
    setAllowance(BigNumber(0));
  }

  useEffect(() => {
    if (!address) setLoadError(undefined);
    if (!address && name) setDefaults();
    if (!DAOService || !address) return;

    DAOService.getERC20TokenData(address)
      .then(({ name, symbol, decimals, totalSupply }) => {
        setName(name);
        setSymbol(symbol);
        setDecimals(decimals);
        setTotalSupply(totalSupply);
        setLoadError(false);
      })
      .catch(error => {
        setDefaults();
        setLoadError(true);
        console.debug("useERC20:getERC20TokenData", logData, error)
      });
        
    updateAllowanceAndBalance();
  }, [wallet?.address, DAOService, address]);

  async function deploy(name: string,
                        symbol: string,
                        cap: string,
                        ownerAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.deployERC20Token } as any]);

      dispatch(transaction);

      await DAOService.deployERC20Token(name, symbol, cap, ownerAddress)
        .then((txInfo: TransactionReceipt) => {
          updateTx.update([parseTransaction(txInfo, transaction.payload[0])])
          resolve(txInfo);
        })
        .catch((err) => {
          dispatch(updateTx.update([{
            ...transaction.payload[0],
            status: err?.code === MetamaskErrors.UserRejected ? TransactionStatus.rejected : TransactionStatus.failed,
          }]));
          reject(err);
        });
    });
  }

  return {
    name,
    symbol,
    balance,
    address,
    decimals,
    loadError,
    allowance,
    totalSupply,
    approve,
    setAddress,
    deploy,
    updateAllowanceAndBalance
  };
}
