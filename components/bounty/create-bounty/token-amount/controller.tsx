import { useEffect, useState } from "react";
import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useDebouncedCallback } from "use-debounce";

import { useAppState } from "contexts/app-state";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";

import { DistributionsProps } from "interfaces/proposal";
import { Token } from "interfaces/token";

import CreateBountyTokenAmountView from "./view";

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

interface CreateBountyTokenAmountProps {
  currentToken: Token;
  updateCurrentToken: (v: Token) => void;
  addToken: (v: Token) => Promise<void>;
  canAddCustomToken: boolean;
  defaultToken: Token;
  userAddress: string;
  customTokens: Token[];
  labelSelect?: string;
  tokenBalance: BigNumber;
  issueAmount: NumberFormatValues;
  updateIssueAmount: (v: NumberFormatValues) => void;
  isFunders: boolean;
  decimals: number;
  isFunding: boolean;
  needValueValidation: boolean;
}

export default function CreateBountyTokenAmount({
  currentToken,
  updateCurrentToken,
  addToken,
  canAddCustomToken,
  defaultToken = null,
  userAddress,
  customTokens,
  labelSelect,
  tokenBalance,
  issueAmount,
  updateIssueAmount,
  isFunders = false,
  needValueValidation,
  decimals = 18,
  isFunding = false,
}: CreateBountyTokenAmountProps) {
  const { t } = useTranslation(["bounty", "common", "proposal"]);
  const [show, setShow] = useState<boolean>(false);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [inputError, setInputError] = useState("");
  const [distributions, setDistributions] = useState<DistributionsProps>();
  const {
    state: { currentUser, Service },
  } = useAppState();

  const debouncedDistributionsUpdater = useDebouncedCallback((value, type) => handleDistributions(value, type), 500);

  const amountIsGtBalance = (v: string | number, balance: BigNumber) => BigNumber(v).gt(balance)

  function handleDistributions(value, type) {
    if (!value || !Service?.network?.amounts) return;
  
    const { treasury, mergeCreatorFeeShare, proposerFeeShare } = Service.network.amounts;

    const handleNumberFormat = (v: BigNumber) => ({
      value: v.toFixed(),
      floatValue: v.toNumber(),
      formattedValue: v.toFixed()
    })
  
    const initialDistributions = calculateDistributedAmounts(treasury,
                                                             mergeCreatorFeeShare,
                                                             proposerFeeShare,
                                                             BigNumber(value),
                                                        [{recipient: currentUser?.walletAddress, percentage: 100}]);

    const { mergerAmount, proposerAmount, treasuryAmount } = initialDistributions;

    const mergerAmountValue = new BigNumber(mergerAmount.value);
    const proposerAmountValue = new BigNumber(proposerAmount.value);
    const treasuryAmountValue = new BigNumber(treasuryAmount.value);

    const totalServiceFees = mergerAmountValue.plus(proposerAmountValue).plus(treasuryAmountValue) || BigNumber(0)

    const distributions = { totalServiceFees, ...initialDistributions}

    if(type === 'reward'){
      const total = totalServiceFees.plus(rewardAmount?.value) 
      updateIssueAmount(handleNumberFormat(total))
      amountIsGtBalance(total.toNumber(), tokenBalance) && setInputError(t("bounty:errors.exceeds-allowance"));
    }

    if(type === 'total'){
      const rewardValue = BigNumber(issueAmount?.value).minus(totalServiceFees) 
      setRewardAmount(handleNumberFormat(rewardValue))
    }

    setDistributions(distributions)
  }

  function handleIssueAmountOnValueChange(values: NumberFormatValues, type: 'reward' | 'total') {
    const setType = type === 'reward' ? setRewardAmount : updateIssueAmount

    if(needValueValidation && amountIsGtBalance(values.floatValue, tokenBalance)){
      setInputError(t("bounty:errors.exceeds-allowance"));
      setType(values);
    }else if (
      needValueValidation &&
      +values.floatValue > +currentToken?.currentValue
    ) {
      setType(ZeroNumberFormatValues);
      setInputError(t("bounty:errors.exceeds-allowance"));
    } else if (values.floatValue < 0) {
      setType(ZeroNumberFormatValues);
    } else if (
      values.floatValue !== 0 &&
      BigNumber(values.floatValue).isLessThan(BigNumber(currentToken?.minimum))
    ) {
      setType(values); 
      setInputError(t("bounty:errors.exceeds-minimum-amount", {
          amount: currentToken?.minimum,
      }));
    } else {
      if(isFunders) debouncedDistributionsUpdater(values.value, type)
      setType(values);
      if (inputError) setInputError("");
    }
  }

  function handleUpdateToken() {
    if (issueAmount?.floatValue === 0) return;

    if (
      BigNumber(issueAmount?.floatValue).isLessThan(BigNumber(currentToken?.minimum))
    ) {
      setInputError(t("bounty:errors.exceeds-minimum-amount", {
          amount: currentToken?.minimum,
      }));
    } else setInputError("");
  }

  useEffect(handleUpdateToken, [currentToken?.minimum]);

  useEffect(() => {
    if(issueAmount?.value && !rewardAmount?.value){
      debouncedDistributionsUpdater(issueAmount.value, 'total')
    }
  }, [issueAmount])

  return (
    <CreateBountyTokenAmountView
      currentToken={currentToken}
      updateCurrentToken={updateCurrentToken}
      addToken={addToken}
      onIssueAmountValueChange={handleIssueAmountOnValueChange}
      canAddCustomToken={canAddCustomToken}
      defaultToken={defaultToken}
      userAddress={userAddress}
      customTokens={customTokens}
      labelSelect={labelSelect}
      tokenBalance={tokenBalance}
      issueAmount={issueAmount}
      rewardAmount={rewardAmount}
      isFunders={isFunders}
      decimals={decimals}
      isFunding={isFunding}
      inputError={inputError}
      showFeesModal={show}
      updateShowFeesModal={setShow}
      distributions={distributions}
    />
  );
}
