import {useEffect, useState,} from "react";
import {FormCheck} from "react-bootstrap";
import {NumberFormatValues} from "react-number-format";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";
import router from "next/router";

import BranchsDropdown from "components/branchs-dropdown";
import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import CreateBountyDetails from "components/create-bounty-details";
import CreateBountyProgress from "components/create-bounty-progress";
import CreateBountyTokenAmount from "components/create-bounty-token-amount";
import {IFilesProps} from "components/drag-and-drop";
import GithubInfo from "components/github-info";
import Modal from "components/modal";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ReposDropdown from "components/repos-dropdown";

import {toastError, toastWarning} from "contexts/reducers/change-toaster";

import { BODY_CHARACTERES_LIMIT } from "helpers/contants";
import {parseTransaction} from "helpers/transactions";

import {MetamaskErrors} from "interfaces/enums/Errors";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import {Token} from "interfaces/token";
import { SimpleBlockTransactionPayload } from "interfaces/transaction";

import {getCoinInfoByContract} from "services/coingecko";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";
import {useNetwork} from "x-hooks/use-network";

import {useAppState} from "../contexts/app-state";
import {addTx, updateTx} from "../contexts/reducers/change-tx-list";
import {changeShowCreateBounty} from "../contexts/reducers/update-show-prop";
import {useRepos} from "../x-hooks/use-repos";
import DropDown from "./dropdown";
import InfoTooltip from "./info-tooltip";

interface BountyPayload {
  title: string;
  cid: string | boolean;
  repoPath: string;
  transactional: string;
  branch: string;
  githubUser: string;
  tokenAmount: string;
  rewardToken?: string;
  rewardAmount?: string;
  fundingAmount?: string;
}

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "bounty"]);

  const [branch, setBranch] = useState<{ value: string, label: string } | undefined>();
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [rewardToken, setRewardToken] = useState<Token>();
  const [bountyTitle, setBountyTitle] = useState<string>("");
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isBountyType, setisBountyType] = useState<boolean>(true);
  const [rewardChecked, setRewardChecked] = useState<boolean>(false);
  const [isKyc, setIsKyc] = useState<boolean>(false);
  const [tierList, setTierList] = useState<number[]>([]);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [bountyDescription, setBountyDescription] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);

  const rewardERC20 = useERC20();

  const transactionalERC20 = useERC20();

  const { handleApproveToken } = useBepro();
  const { getURLWithNetwork } = useNetwork();
  const { createPreBounty, processEvent } = useApi();
  const {updateActiveRepo} = useRepos();

  const {
    dispatch,
    state: {
      transactions,
      Settings,
      Service,
      currentUser,
      show: { createBounty: showCreateBounty }
    },
  } = useAppState();

  const steps = [
    t("bounty:steps.details"),
    t("bounty:steps.bounty"),
    t("bounty:steps.additional-details"),
    t("bounty:steps.review"),
  ];

  function onUpdateFiles(files: IFilesProps[]) {
    return setFiles(files);
  }

  function addFilesInDescription(str) {
    const strFiles = files?.map((file) =>
        file.uploaded &&
        `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
          Settings?.urls?.ipfs
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
    if(!(e.target.checked)){
      setRewardAmount(ZeroNumberFormatValues)
      setRewardToken(undefined);
    }
  }

  function handleIsKYCChecked(e) {
    setIsKyc(e.target.checked);
  }

  function renderDetails(review = false) {
    return (
      <CreateBountyDetails
        bountyTitle={bountyTitle}
        setBountyTitle={setBountyTitle}
        bountyDescription={bountyDescription}
        setBountyDescription={setBountyDescription}
        onUpdateFiles={onUpdateFiles}
        onUploading={setIsUploading}
        review={review}
        files={files}
      />
    );
  }

  function renderBountyToken(review = false, type: "bounty" | "reward") {
    const fieldParams = {
      bounty: {
        token: transactionalToken,
        setToken: setTransactionalToken,
        default: transactionalToken,
        decimals: transactionalERC20?.decimals,
        amount: issueAmount,
        setAmount: setIssueAmount,
        tokens: customTokens.filter(token => token?.isTransactional !== false),
        balance: transactionalERC20.balance,
        isFunding: false,
        label: t("bounty:fields.select-token.bounty", { set: review ? "" : t("bounty:fields.set") })
      },
      reward: {
        token: rewardToken,
        setToken: setRewardToken,
        default: rewardToken,
        decimals: transactionalERC20?.decimals,
        amount: rewardAmount,
        setAmount: setRewardAmount,
        tokens: customTokens.filter(token => token?.isTransactional !== true),
        balance: rewardERC20.balance,
        isFunding: true,
        label: t("bounty:fields.select-token.reward", { set: review ? "" : t("bounty:fields.set") })
      }
    };

    return (
      <CreateBountyTokenAmount
        currentToken={fieldParams[type].token}
        setCurrentToken={fieldParams[type].setToken}
        customTokens={fieldParams[type].tokens}
        userAddress={currentUser?.walletAddress}
        defaultToken={review && fieldParams[type].default}
        canAddCustomToken={Service?.network?.active?.allowCustomTokens}
        addToken={addToken}
        decimals={fieldParams[type].decimals}
        issueAmount={fieldParams[type].amount}
        setIssueAmount={fieldParams[type].setAmount}
        tokenBalance={fieldParams[type].balance}
        needValueValidation={isBountyType || type === 'reward'}
        labelSelect={fieldParams[type].label}
        review={review}
      />
    );
  }

  function renderCurrentSection() {

    if (currentSection === 0) {
      return renderDetails();
    }
    if (currentSection === 1) {
      return (
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <Button
                color="black"
                className={`container-bounty w-100 bg-30-hover ${
                  isBountyType && "funding-type"
                }`}
                onClick={() => {
                  setisBountyType(true);
                  setRewardChecked(false);
                  setRewardAmount(ZeroNumberFormatValues);
                  setIssueAmount(ZeroNumberFormatValues);
                }}
              >
                <span>{t("bounty:steps.bounty")}</span>
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                color="black"
                className={`container-bounty w-100 bg-30-hover ${
                  !isBountyType && "funding-type"
                }`}
                onClick={() => {
                  setisBountyType(false);
                  setRewardChecked(true);
                  setIsKyc(false);
                  setTierList([]);
                  setIssueAmount(ZeroNumberFormatValues);
                }}
              >
                <span>{t("bounty:steps.funding-request")}</span>
              </Button>
            </div>
            {renderBountyToken(false, "bounty")}
            {!isBountyType && (
              <>
                <div className="col-md-12">
                  <FormCheck
                    className="form-control-md pb-0"
                    type="checkbox"
                    label={t("bounty:reward-funders")}
                    onChange={handleRewardChecked}
                    checked={rewardChecked}
                  />
                </div>
                {rewardChecked && renderBountyToken(false, "reward")}
              </>
            )}
            {isBountyType && Settings?.kyc?.isKycEnabled ? (
              <>
                <div className="col-md-12 d-flex flex-row gap-2">
                  <FormCheck
                    className="form-control-md pb-0"
                    type="checkbox"
                    label={t("bounty:kyc.is-required")}
                    onChange={handleIsKYCChecked}
                    checked={isKyc}
                  />
                  <span>
                    <InfoTooltip
                      description={t("bounty:kyc.tool-tip")}
                      secondaryIcon
                    />
                  </span>
                </div>
                {isKyc && Settings?.kyc?.tierList?.length ? (
                  <DropDown
                    className="mt-2"
                    onSelected={(opt) =>{
                      setTierList(Array.isArray(opt) ? opt.map((i) => +i.value) : [+opt.value])
                    }
                    }
                    options={Settings?.kyc?.tierList.map((i) => ({
                      value: i.id,
                      label: i.name,
                    }))}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      );
    }
    if (currentSection === 2) {
      return (
        <div className="container pt-4">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <ReposDropdown
                onSelected={(opt) => {
                  updateActiveRepo(opt.value.id);
                  setRepository(opt.value)
                  setBranch(null)
                }}
                value={{
                  label: repository?.path,
                  value: repository,
                }}
              />
            </div>
            <div className="col-md-6">
              <BranchsDropdown
                repoId={repository?.id}
                onSelected={(opt) => setBranch(opt)}
                value={branch}
              />
            </div>
          </div>
        </div>
      );
    }
    if (currentSection === 3) {
      return (
        <>
          {renderDetails(true)}
          {renderBountyToken(true, "bounty")}
          {rewardChecked && renderBountyToken(true, "reward")}
          <div className="container">
            <div className="row">
              <div className="col-md-6 text-truncate">
                <label className="caption-small mb-2">
                  {t("bounty:review.repository")}
                </label>
              <GithubInfo
                parent="list"
                variant="repository"
                label={repository?.path.length <= 20 ? repository?.path : repository?.path.slice(0,20)+"..."}
                simpleDisabled={true}
              />
              </div>
              <div className="col-md-6 text-truncate">
                <label className="caption-small mb-2 ms-3">
                  {t("bounty:review.branch")}
                </label>
                <div className="ms-3">
                  <GithubInfo
                    parent="list"
                    variant="repository"
                    label={branch?.label?.length <= 20 ? branch?.label : branch?.label.slice(0,20)+"..."}
                    simpleDisabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  }

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

  function handleNextStepAndCreate() {
    currentSection + 1 < steps.length &&
      setCurrentSection((prevState) => prevState + 1);
    if (currentSection === 3) {
      createBounty();
    }
  }

  //TODO: add some function
  function verifyNextStepAndCreate() {
    if (isLoadingCreateBounty) return true;
    
    const isIssueAmount =
      issueAmount.floatValue <= 0 || issueAmount.floatValue === undefined;
    const isRewardAmount =
      rewardAmount.floatValue <= 0 || rewardAmount.floatValue === undefined;
    if (
        (currentSection === 0 && !bountyTitle) ||
        !bountyDescription ||
        isUploading ||
        addFilesInDescription(bountyDescription).length > BODY_CHARACTERES_LIMIT
        || bountyTitle.length >= 131
      )
      return true;
    if (currentSection === 1 && isBountyType && isIssueAmount) return true;
    if (
      currentSection === 1 &&
      !isBountyType &&
      !rewardChecked &&
      isIssueAmount
    )
      return true;
    if (
      currentSection === 1 &&
      !isBountyType &&
      rewardChecked &&
      isIssueAmount
    )
      return true;
    if (
      currentSection === 1 &&
      !isBountyType &&
      rewardChecked &&
      isRewardAmount
    )
      return true;
    
    if (
      currentSection === 1 &&
      isKyc &&
      !tierList.length
    )
      return true;
      
    if (currentSection === 2 && (!repository || !branch)) return true;
    if (currentSection === 3 && !isTokenApproved) return true;
    return currentSection === 3 && isLoadingCreateBounty;


  }

  function handleCancelAndBack() {
    if (currentSection === 0) {
      cleanFields();
      dispatch(changeShowCreateBounty(false))
    } else {
      setCurrentSection((prevState) => prevState - 1);
    }
  }

  function setProgressBar() {
    const progress = [0, 30, 60, 100];
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])]);
  }

  function cleanFields() {
    setFiles([]);
    setBountyTitle("");
    setBountyDescription("");
    setIssueAmount(ZeroNumberFormatValues);
    setRewardAmount(ZeroNumberFormatValues);
    setRepository(undefined);
    setBranch(null);
    setIsKyc(false);
    setTierList([]);
    setCurrentSection(0);
  }

  const isAmountApproved = (tokenAllowance: BigNumber, amount: BigNumber) => !tokenAllowance.lt(amount);

  async function allowCreateIssue() {
    if (!Service?.active || !transactionalToken || issueAmount.floatValue <= 0)
      return;

    setIsLoadingApprove(true)

    let tokenAddress = transactionalToken.address;
    let bountyValue = issueAmount.value;
    let tokenERC20 = transactionalERC20;

    if (rewardChecked && rewardToken?.address && rewardAmount.floatValue > 0) {
      tokenAddress = rewardToken.address;
      bountyValue = rewardAmount.value;
      tokenERC20 = rewardERC20;
    }

    handleApproveToken(tokenAddress, bountyValue)
      .then(() => {
        return tokenERC20.updateAllowanceAndBalance();
      })
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
    if (!repository || !transactionalToken || !Service?.active || !currentUser) return;

    setIsLoadingCreateBounty(true)

    try {
      const payload = {
        title: bountyTitle,
        body: addFilesInDescription(bountyDescription),
        amount: issueAmount.value,
        creatorAddress: currentUser.walletAddress,
        githubUser: currentUser?.login,
        repositoryId: repository?.id,
        branch,
      };

      const cid = await createPreBounty({
        title: payload.title,
        body: payload.body,
        creator: payload.githubUser,
        repositoryId: payload.repositoryId,
        isKyc: isBountyType ? isKyc : false,
        tierList: isBountyType ? tierList : null,
      }, Service?.network?.active?.name)
      .then((cid) => cid)

      if (!cid){
        return dispatch(toastError(t("bounty:errors.creating-bounty")));
      }
      
      const transactionToast =  addTx([{
        type: TransactionTypes.openIssue, 
        amount: payload.amount,
        network: Service?.network?.active
      }]);

      dispatch(transactionToast);

      const bountyPayload: BountyPayload = {
        cid,
        branch: branch.value,
        repoPath: repository.path,
        transactional: transactionalToken.address,
        title: payload.title,
        tokenAmount: payload.amount,
        githubUser: payload.githubUser,
      };

      if (!isBountyType && !rewardChecked) {
        bountyPayload.tokenAmount = "0";
        bountyPayload.fundingAmount = issueAmount.value;
      }

      if (rewardChecked) {
        bountyPayload.tokenAmount = "0";
        bountyPayload.rewardAmount = rewardAmount.value;
        bountyPayload.rewardToken = rewardToken.address;
        bountyPayload.fundingAmount = issueAmount.value;
      }

      const networkBounty = await Service?.active.openBounty(bountyPayload).catch((e) => {

        dispatch(updateTx([{
          ...transactionToast.payload[0],
          status: e?.code === MetamaskErrors.UserRejected ? TransactionStatus.failed : TransactionStatus.failed,
        }]));

        if (e?.code === MetamaskErrors.ExceedAllowance)
          dispatch(toastError(t("bounty:errors.exceeds-allowance")));
        else if(e?.code === MetamaskErrors.UserRejected)
          dispatch(toastError(t("bounty:errors.bounty-canceled")))
        else 
          dispatch(toastError(e.message || t("bounty:errors.creating-bounty")));
        
        console.debug(e);

        return {...e, error: true};
      });

      if (networkBounty?.error !== true) {
        dispatch(updateTx([
          parseTransaction(networkBounty, transactionToast.payload[0] as SimpleBlockTransactionPayload)]));

        const createdBounty = await processEvent("bounty",
                                                 "created",
                                                 Service?.network?.active?.name,
      { fromBlock: networkBounty?.blockNumber})

        if (!createdBounty){
          dispatch(toastWarning(t("bounty:errors.sync")));
        }
    
        if (createdBounty?.[cid]) {
          const [repoId, githubId] = String(cid).split("/");

          router.push(getURLWithNetwork("/bounty", {
          id: githubId,
          repoId,
          }));
        }

        cleanFields();
        dispatch(changeShowCreateBounty(false))
      }  
    }finally{
      setIsLoadingCreateBounty(false)
    }
  }

  useEffect(() => {
    if(!showCreateBounty) return;
    if (transactionalToken?.address) transactionalERC20.setAddress(transactionalToken.address);
  }, [transactionalToken?.address, currentUser, Service?.active]);

  useEffect(() => {
    if(!showCreateBounty) return;
    if (rewardToken?.address) rewardERC20.setAddress(rewardToken.address);
  }, [rewardToken?.address, currentUser, Service?.active]);

  useEffect(() => {
    if(!showCreateBounty || currentSection !== 1) return;
    setIssueAmount(ZeroNumberFormatValues);
  }, [transactionalToken, showCreateBounty]);

  useEffect(() => {
    if(!showCreateBounty || currentSection !== 1) return;
    setRewardAmount(ZeroNumberFormatValues);
  }, [rewardToken, showCreateBounty]);

  useEffect(() => {
    if(!showCreateBounty) return;
    setProgressBar();
  }, [currentSection, showCreateBounty]);

  useEffect(() => {
    if(!showCreateBounty) return;
    if(customTokens?.length === 1) {
      setTransactionalToken(customTokens[0])
      setRewardToken(customTokens[0])
    }
  }, [customTokens, showCreateBounty]);

  useEffect(() => {
    if(!showCreateBounty) return;
    let approved = true

    if (isBountyType)
      approved = isAmountApproved(transactionalERC20.allowance, BigNumber(issueAmount.value));
    else if (rewardChecked)
      approved = isAmountApproved(rewardERC20.allowance, BigNumber(rewardAmount.value));

    setIsTokenApproved(approved);
  }, [transactionalERC20.allowance, rewardERC20.allowance, issueAmount, rewardAmount, rewardChecked]);

  useEffect(() => {
    if (!Service?.network?.tokens || !showCreateBounty)
      return;

    const {transactional, reward} = Service?.network?.tokens || {};

    if (transactional.length + reward.length === customTokens.length)
      return;

    setCustomTokens([...transactional, ...reward]);

  }, [Service?.network?.active?.tokens, showCreateBounty]);

  useEffect(()=>{
    cleanFields();
    if(!showCreateBounty) return;
    transactionalERC20.updateAllowanceAndBalance();
    rewardERC20.updateAllowanceAndBalance();
  },[showCreateBounty])

  if(!showCreateBounty)
    return <></>

  if (showCreateBounty && !currentUser?.walletAddress)
    return <ConnectWalletButton asModal={true} />;

  return (
    <>
      <Modal
        show={showCreateBounty && !!currentUser?.walletAddress}
        title={t("bounty:title")}
        titlePosition="center"
        onCloseClick={() => {
          cleanFields();
          dispatch(changeShowCreateBounty(false))
          setRewardChecked(false);
        }}
        onCloseDisabled={isLoadingApprove || isLoadingCreateBounty || isUploading}
        footer={
          <>
            <div className="d-flex flex-row justify-content-between">
              <Button 
                color="dark-gray" 
                onClick={handleCancelAndBack} 
                disabled={isLoadingApprove || isLoadingCreateBounty || isUploading}
              >
                <span>
                  {currentSection === 0
                    ? t("common:actions.cancel")
                    : t("common:actions.back")}
                </span>
              </Button>

              {!isTokenApproved && currentSection === 3 ? (
                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button"
                    disabled={isApproveButtonDisabled()}
                    onClick={allowCreateIssue}
                    isLoading={isLoadingApprove}
                  >
                    {t("actions.approve")}
                  </Button>
                </ReadOnlyButtonWrapper>
              ) : null}

              { (isTokenApproved && currentSection === 3 || currentSection !== 3) &&
                <Button
                  className="d-flex flex-shrink-0 w-40 btn-block"
                  onClick={handleNextStepAndCreate}
                  disabled={verifyNextStepAndCreate()}
                  isLoading={isLoadingCreateBounty}
                >
                  <span>
                    {currentSection !== 3
                      ? t("bounty:next-step")
                      : t("bounty:create-bounty")}
                  </span>
                </Button>
              }
            </div>
          </>
        }
      >
        <CreateBountyProgress
            steps={steps}
            currentSection={currentSection}
            progressPercentage={progressPercentage}
          />
        {renderCurrentSection()}
      </Modal>
    </>
  );
}
