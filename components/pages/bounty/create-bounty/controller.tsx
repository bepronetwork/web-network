import {useEffect, useState} from "react";
import {NumberFormatValues} from "react-number-format";

import BigNumber from "bignumber.js";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import router, {useRouter} from "next/router";
import {useDebouncedCallback} from "use-debounce";

import {IFilesProps} from "components/drag-and-drop";
import CreateBountyPageView from "components/pages/bounty/create-bounty/view";

import {useAppState} from "contexts/app-state";
import {toastError, toastWarning} from "contexts/reducers/change-toaster";
import {addTx, updateTx} from "contexts/reducers/change-tx-list";

import {BODY_CHARACTERES_LIMIT, UNSUPPORTED_CHAIN} from "helpers/constants";
import {addFilesToMarkdown} from "helpers/markdown";
import {parseTransaction} from "helpers/transactions";
import {isValidUrl} from "helpers/validateUrl";

import {BountyPayload} from "interfaces/create-bounty";
import {MetamaskErrors, OriginLinkErrors} from "interfaces/enums/Errors";
import {NetworkEvents} from "interfaces/enums/events";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import {Network} from "interfaces/network";
import {SupportedChainData} from "interfaces/supported-chain-data";
import {Token} from "interfaces/token";
import {SimpleBlockTransactionPayload} from "interfaces/transaction";

import {getCoinInfoByContract, getCoinList} from "services/coingecko";

import {useCreatePreBounty} from "x-hooks/api/bounty";
import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useDao} from "x-hooks/use-dao";
import useERC20 from "x-hooks/use-erc20";
import {useNetwork} from "x-hooks/use-network";
import useNetworkChange from "x-hooks/use-network-change";

import {CustomSession} from "../../../../interfaces/custom-session";
import {UserRoleUtils} from "../../../../server/utils/jwt";

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

interface CreateBountyPageProps {
  networks: Network[];
}

export default function CreateBountyPage({
  networks: allNetworks
}: CreateBountyPageProps) {
  const { query } = useRouter();
  const { t } = useTranslation(["common", "bounty"]);

  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [rewardToken, setRewardToken] = useState<Token>();
  const [bountyTitle, setBountyTitle] = useState<string>("");
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isFundingType, setIsFundingType] = useState<boolean>(false);
  const [rewardChecked, setRewardChecked] = useState<boolean>(false);
  const [isKyc, setIsKyc] = useState<boolean>(false);
  const [tierList, setTierList] = useState<number[]>([]);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [bountyDescription, setBountyDescription] = useState<string>("");
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<Network>();
  const [networksOfConnectedChain, setNetworksOfConnectedChain] = useState<Network[]>([]);
  const [deliverableType, setDeliverableType] = useState<string>();
  const [originLink, setOriginLink] = useState<string>("");
  const [originLinkError, setOriginLinkError] = useState<OriginLinkErrors>();
  const [userCanCreateBounties, setUserCanCreateBounties] = useState<boolean>(true);
  const [showCannotCreateBountyModal, setShowCannotCreateBountyModal] = useState<boolean>(true);
  const session = useSession();


  const rewardERC20 = useERC20();
  const transactionalERC20 = useERC20();
  const { processEvent } = useApi();
  const { handleApproveToken } = useBepro();
  const { changeNetwork, start } = useDao();
  const { getURLWithNetwork } = useNetwork();
  const { handleAddNetwork } = useNetworkChange();

  const {
    dispatch,
    state: { transactions, Settings, Service, currentUser, connectedChain, },
  } = useAppState();

  const steps = [
    t("bounty:steps.select-network"),
    t("bounty:steps.details"),
    t("bounty:steps.reward"),
    t("bounty:steps.review"),
  ];

  const isAmountApproved = (tokenAllowance: BigNumber, amount: BigNumber) =>
    !tokenAllowance.lt(amount);

  const handleIsLessThan = (v: number, min: string) =>
    BigNumber(v).isLessThan(BigNumber(min));

  async function addToken(newToken: Token) {
    await getCoinInfoByContract(newToken?.symbol)
      .then((tokenInfo) => {
        setCustomTokens([...customTokens, { ...newToken, tokenInfo }]);
      })
      .catch((err) => {
        console.error("coinErro", err);
        setCustomTokens([...customTokens, newToken]);
      });
  }

  function validateBannedDomain(link: string) {
    return !!currentNetwork?.banned_domains?.some(banned => link.toLowerCase().includes(banned.toLowerCase()));
  }

  const validateDomainDebounced = useDebouncedCallback((link: string) => {
    if (!link) {
      setOriginLinkError(undefined);
      return;
    }
    const isValid = isValidUrl(link);
    const isBanned = validateBannedDomain(link);
    if (!isValid)
      setOriginLinkError(OriginLinkErrors.Invalid);
    else if (isBanned) 
      setOriginLinkError(OriginLinkErrors.Banned);
    else 
      setOriginLinkError(undefined);
  }, 500);

  function handleOriginLinkChange(newLink: string) {
    setOriginLink(newLink);
    validateDomainDebounced(newLink);
  }

  async function handleCustomTokens(tokens: Token[]) {
    await getCoinList() // ask for list so it we don't do that on the loop;

    Promise.all(tokens?.map(async (token) => {
      const newTokens = await getCoinInfoByContract(token?.symbol)
        .then((tokenInfo) => ({ ...token, tokenInfo }))
        .catch(() => token);
      return newTokens
    })).then(t => setCustomTokens(t))
  }

  function onUpdateFiles(files: IFilesProps[]) {
    return setFiles(files);
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
    if (!e.target.checked) {
      setRewardAmount(ZeroNumberFormatValues);
      setRewardToken(undefined);
    }
  }

  function verifyNextStepAndCreate(newSection?: number) {
    if (!userCanCreateBounties)
      return true;

    const section = newSection || currentSection
    if (isLoadingCreateBounty) return true;

    const isIssueAmount =
      issueAmount.floatValue <= 0 ||
      issueAmount.floatValue === undefined ||
      handleIsLessThan(issueAmount.floatValue, transactionalToken?.minimum) ||
      (!isFundingType && BigNumber(issueAmount.floatValue).gt(transactionalERC20?.balance)) 

    const isRewardAmount =
      rewardAmount.floatValue <= 0 ||
      rewardAmount.floatValue === undefined ||
      handleIsLessThan(rewardAmount.floatValue, rewardToken?.minimum) ||
      BigNumber(issueAmount.floatValue).gt(rewardERC20?.balance)

    if (section === 0 && !currentNetwork) return true;

    if (
      section === 1 &&
      (!bountyTitle ||
        !bountyDescription ||
        isUploading ||
        addFilesInDescription(bountyDescription).length >
          BODY_CHARACTERES_LIMIT ||
        bountyTitle.length >= 131)
    )
      return true;

    if (section === 1 && (!deliverableType || !!originLinkError)) return true;

    if (section === 2 && !isFundingType && isIssueAmount) return true;
    if (
      section === 2 &&
      isFundingType &&
      !rewardChecked &&
      isIssueAmount
    )
      return true;
    if (section === 2 && isFundingType && rewardChecked && isIssueAmount)
      return true;
    if (
      section === 2 &&
      isFundingType &&
      rewardChecked &&
      isRewardAmount
    )
      return true;

    if (
      section === 2 &&
      isKyc &&
      Settings?.kyc?.tierList?.length &&
      !tierList.length
    )
      return true;

    if (section === 3 && !isTokenApproved) return true;

    return section === 3 && isLoadingCreateBounty;
  }

  function addFilesInDescription(str) {
    return addFilesToMarkdown(str, files, Settings?.urls?.ipfs);
  }

  async function allowCreateIssue() {
    if (!Service?.active || !transactionalToken || issueAmount.floatValue <= 0)
      return;

    setIsLoadingApprove(true);

    let tokenAddress = transactionalToken.address;
    let bountyValue = issueAmount.value;
    let tokenERC20 = transactionalERC20;

    if (rewardChecked && rewardToken?.address && rewardAmount.floatValue > 0) {
      tokenAddress = rewardToken.address;
      bountyValue = rewardAmount.value;
      tokenERC20 = rewardERC20;
    }

    handleApproveToken(tokenAddress, bountyValue, undefined, transactionalToken?.symbol)
      .then(() => {
        return tokenERC20.updateAllowanceAndBalance();
      })
      .catch(error => console.debug("Failed to approve", error))
      .finally(() => setIsLoadingApprove(false));
  }

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!transactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  const isApproveButtonDisabled = (): boolean =>
    [
      !isTokenApproved,
      !verifyTransactionState(TransactionTypes.approveTransactionalERC20Token),
    ].some((value) => value === false);

  async function createBounty() {
    if (!deliverableType || !transactionalToken || !Service?.active || !currentUser)
      return;

    setIsLoadingCreateBounty(true);

    try {
      const payload = {
        title: bountyTitle,
        body: addFilesInDescription(bountyDescription),
        amount: issueAmount.value,
        creatorAddress: currentUser.walletAddress,
        githubUser: currentUser?.login,
        deliverableType,
        originLink
      };

      const savedIssue = await useCreatePreBounty({
          title: payload.title,
          body: payload.body,
          creator: payload.githubUser,
          deliverableType,
          origin: originLink,
          tags: selectedTags,
          isKyc: isKyc,
          tierList: tierList?.length ? tierList : null,
          amount: issueAmount.value,
          networkName: currentNetwork?.name
      });

      if (!savedIssue) {
        return dispatch(toastError(t("bounty:errors.creating-bounty")));
      }

      const transactionToast = addTx([
        {
          type: TransactionTypes.openIssue,
          amount: payload.amount,
          network: currentNetwork,
          currency: transactionalToken?.symbol
        },
      ]);

      dispatch(transactionToast);

      const bountyPayload: BountyPayload = {
        cid: savedIssue.ipfsUrl,
        transactional: transactionalToken.address,
        title: payload.title,
        tokenAmount: payload.amount
      };

      if (isFundingType && !rewardChecked) {
        bountyPayload.tokenAmount = "0";
        bountyPayload.fundingAmount = issueAmount.value;
      }

      if (isFundingType && rewardChecked) {
        bountyPayload.tokenAmount = "0";
        bountyPayload.rewardAmount = rewardAmount.value;
        bountyPayload.rewardToken = rewardToken.address;
        bountyPayload.fundingAmount = issueAmount.value;
      }

      const networkBounty = await Service?.active
        .openBounty(bountyPayload)
        .catch((e) => {
          dispatch(updateTx([
              {
                ...transactionToast.payload[0],
                status:
                  e?.code === MetamaskErrors.UserRejected
                    ? TransactionStatus.failed
                    : TransactionStatus.failed,
              },
          ]));

          if (e?.code === MetamaskErrors.ExceedAllowance)
            dispatch(toastError(t("bounty:errors.exceeds-allowance")));
          else if (e?.code === MetamaskErrors.UserRejected)
            dispatch(toastError(t("bounty:errors.bounty-canceled")));
          else
            dispatch(toastError(e.message || t("bounty:errors.creating-bounty")));

          console.debug(e);

          return { ...e, error: true };
        });

      if (networkBounty?.error !== true) {
        dispatch(updateTx([
            parseTransaction( networkBounty,
                              transactionToast.payload[0] as SimpleBlockTransactionPayload),
        ]));

        const createdBounty = await processEvent(NetworkEvents.BountyCreated, currentNetwork?.networkAddress, {
          fromBlock: networkBounty?.blockNumber
        }, currentNetwork?.name);

        if (!createdBounty) {
          dispatch(toastWarning(t("bounty:errors.sync")));
        }

        if (createdBounty?.[savedIssue.id]) {
          router.push(getURLWithNetwork("/bounty/[id]", {
              chain: connectedChain?.shortName,
              network: currentNetwork?.name,
              id: savedIssue.id
          }))
            .then(() => cleanFields());
        }
      }
    } finally {
      setIsLoadingCreateBounty(false);
    }
  }

  function cleanFields() {
    setFiles([]);
    setSelectedTags([]);
    setBountyTitle("");
    setBountyDescription("");
    setIssueAmount(ZeroNumberFormatValues);
    setRewardAmount(ZeroNumberFormatValues);
    setDeliverableType(undefined);
    setOriginLink("");
    setIsKyc(false);
    setTierList([]);
    setCurrentSection(0);
    rewardERC20.setAddress(undefined);
    transactionalERC20.setAddress(undefined);
  }

  function handleMinAmount(type: "reward" | "transactional") {
    if(currentSection === 3){
      const amount = type === "reward" ? rewardAmount : issueAmount 
      const isAmount =
      amount.floatValue <= 0 ||
      amount.floatValue === undefined ||
      handleIsLessThan(amount.floatValue, transactionalToken?.minimum);

      if(isAmount) setCurrentSection(2)
    }
  }

  
  function handleUpdateToken(e: Token, type: 'transactional' | 'reward') {
    const ERC20 = type === 'transactional' ? transactionalERC20 : rewardERC20
    const setToken = type === 'transactional' ? setTransactionalToken : setRewardToken
    setToken(e)
    ERC20.setAddress(e.address) 
  }

  function handleNextStep() {
    if (!userCanCreateBounties)
      return;

    if (currentSection + 1 < steps.length){
      setCurrentSection((prevState) => prevState + 1);
    }
      
    if (currentSection === 3) {
      createBounty();
    }
  }

  useEffect(() => {
    if(!connectedChain) return;

    if (connectedChain.name === UNSUPPORTED_CHAIN) {
      setCurrentNetwork(undefined);
      
      return;
    }
      
    const networksOfChain = allNetworks.filter(({ chain_id }) => +chain_id === +connectedChain.id);

    setNetworksOfConnectedChain(networksOfChain);
  }, [connectedChain]);

  useEffect(() => {
    let approved = true;

    if (!isFundingType)
      approved = isAmountApproved(transactionalERC20.allowance,
                                  BigNumber(issueAmount.value));
    else if (rewardChecked)
      approved = isAmountApproved(rewardERC20.allowance,
                                  BigNumber(rewardAmount.value));

    setIsTokenApproved(approved);
  }, [
    transactionalERC20.allowance,
    rewardERC20.allowance,
    issueAmount,
    rewardAmount,
    rewardChecked,
  ]);

  useEffect(() => {
    if (!currentNetwork?.tokens) {
      setTransactionalToken(undefined);
      setRewardToken(undefined);
      setCustomTokens([]);
      transactionalERC20.setAddress(undefined);
      rewardERC20.setAddress(undefined);
      return;
    } else {
      const tokens = currentNetwork?.tokens

      if (tokens.length === 1) {
        handleUpdateToken(tokens[0], 'transactional');
        handleUpdateToken(tokens[0], 'reward');
      }

      if (tokens.length !== customTokens.length)
        handleCustomTokens(tokens)
    }
  }, [currentNetwork?.tokens]);

  useEffect(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), [currentSection])
  useEffect(() => handleMinAmount('transactional'), [issueAmount])
  useEffect(() => handleMinAmount('reward'), [rewardAmount])
  useEffect(() => {
    setUserCanCreateBounties(!currentNetwork?.id ? true :
      (session?.data as CustomSession)?.user?.roles
        ? UserRoleUtils.hasCreateBountyRole((session?.data as CustomSession)?.user?.roles, currentNetwork?.id)
        : true) // if no session roles are found we will let the normal flow deal with an unauthenticated user
  }, [currentNetwork]);
  useEffect(() => {
    setShowCannotCreateBountyModal(!userCanCreateBounties)
  }, [userCanCreateBounties]);

  useEffect(() => {
    cleanFields();
    
    if (query?.type === "funding")
      setIsFundingType(true);
  }, []);

  async function handleNetworkSelected(chain: SupportedChainData) {
    setCurrentNetwork(undefined)
    handleAddNetwork(chain)
      .then(_ => setCurrentNetwork(networksOfConnectedChain[0]))
      .catch((err) => console.log('handle Add Network error', err));
  }

  function handleBackButton() {
    if(currentSection !== 0)
      setCurrentSection((prevState) => prevState - 1);
  }

  async function onNetworkSelected(opt) {
    changeNetwork(opt.chain_id, opt?.networkAddress)
      .then(_ => setCurrentNetwork(opt));
  }

  function handleSectionHeaderClick(i: number) {
    if(!verifyNextStepAndCreate(i === 0 ? i : i-1) || currentSection > i){
      setCurrentSection(i)
    }
  }

  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    if (!currentNetwork)
      return;

    changeNetwork(currentNetwork.chain_id, currentNetwork?.networkAddress)
  }, [currentNetwork, Service?.active])


  return(
    <CreateBountyPageView
      isConnected={!!currentUser?.walletAddress}
      deliverableType={deliverableType}
      currentSection={currentSection}
      isTokenApproved={isTokenApproved}
      isBackButtonDisabled={currentSection === 0}
      isApproveButtonDisabled={isApproveButtonDisabled()}
      isApproving={isLoadingApprove}
      isNextOrCreateButtonDisabled={verifyNextStepAndCreate()}
      isCreating={isLoadingCreateBounty}
      creationSteps={steps}
      onBackClick={handleBackButton}
      onApproveClick={allowCreateIssue}
      onNextOrCreateButtonClick={handleNextStep}
      onSectionHeaderClick={handleSectionHeaderClick}
      currentNetwork={currentNetwork}
      networksOfCurrentChain={networksOfConnectedChain}
      onChainChange={handleNetworkSelected}
      onNetworkChange={onNetworkSelected}
      title={bountyTitle}
      updateTitle={setBountyTitle}
      description={bountyDescription}
      updateDescription={setBountyDescription}
      files={files}
      updateFiles={onUpdateFiles}
      selectedTags={selectedTags}
      updateSelectedTags={setSelectedTags}
      isKyc={isKyc}
      updateIsKyc={setIsKyc}
      updateTierList={setTierList}
      updateUploading={setIsUploading}
      originLink={originLink}
      originLinkError={originLinkError}
      onOriginLinkChange={handleOriginLinkChange}
      setDeliverableType={setDeliverableType}
      isFundingType={isFundingType} 
      rewardChecked={rewardChecked} 
      transactionalToken={transactionalToken} 
      rewardToken={rewardToken} 
      bountyDecimals={transactionalERC20?.decimals} 
      rewardDecimals={transactionalERC20?.decimals} 
      issueAmount={issueAmount} 
      rewardAmount={rewardAmount} 
      bountyTokens={customTokens.filter((token) => !!token?.network_tokens?.isTransactional)} 
      rewardTokens={customTokens.filter((token) => !!token?.network_tokens?.isReward)} 
      rewardBalance={rewardERC20.balance} 
      bountyBalance={transactionalERC20.balance} 
      updateRewardToken={(v) => handleUpdateToken(v, 'reward')} 
      updateTransactionalToken={(v) => handleUpdateToken(v, 'transactional')} 
      addToken={addToken} 
      handleRewardChecked={handleRewardChecked} 
      updateIssueAmount={setIssueAmount} 
      updateRewardAmount={setRewardAmount} 
      updateIsFundingType={setIsFundingType}
      payload={{
        network: currentNetwork?.name,
        title: bountyTitle,
        description: addFilesInDescription(bountyDescription),
        tags: selectedTags && selectedTags,
        origin_link: originLink,
        deliverable_type: deliverableType,
        reward: `${issueAmount.value} ${transactionalToken?.symbol}`,
        funders_reward:
          (rewardAmount.value && isFundingType) &&
          `${rewardAmount.value} ${rewardToken?.symbol}`,
      }}
      allowCreateBounty={userCanCreateBounties}
      showCannotCreateBountyModal={showCannotCreateBountyModal}
      closeCannotCreateBountyModal={() => setShowCannotCreateBountyModal(false)}
    />
  );
}