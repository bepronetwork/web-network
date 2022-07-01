import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";
import router from "next/router";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BEPRO_TOKEN, Token, TokenInfo } from "interfaces/token";
import { BlockTransaction } from "interfaces/transaction";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";
import useTransactions from "x-hooks/useTransactions";

import { toastError, toastWarning } from "../contexts/reducers/add-toast";
import { updateTransaction } from "../contexts/reducers/update-transaction";
import BranchsDropdown from "./branchs-dropdown";
import CreateBountyDetails from "./create-bounty-details";
import CreateBountyProgress from "./create-bounty-progress";
import CreateBountyTokenAmount from "./create-bounty-token-amount";
import { IFilesProps } from "./drag-and-drop";
import GithubInfo from "./github-info";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import ReposDropdown from "./repos-dropdown";


const { publicRuntimeConfig } = getConfig();

interface chainPayload {
   title: string, 
   cid: string | boolean,  
   repoPath: string,
   transactional: string,
   branch: string
   githubUser: string,
   tokenAmount: number,
   rewardToken?: string,
   rewardAmount?: number,
   fundingAmount?: number,
}

interface Amount {
  value?: string;
  formattedValue: string;
  floatValue?: number;
}

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "create-bounty"]);

  const { activeNetwork } = useNetwork();
  const { getURLWithNetwork } = useNetworkTheme();
  const { handleApproveToken } = useBepro();
  const { createPreBounty, processEvent } = useApi();
  const txWindow = useTransactions();
  const {
    dispatch,
    state: { myTransactions },
  } = useContext(ApplicationContext);
  const [show, setShow] = useState<boolean>(false);
  const [bountyTitle, setBountyTitle] = useState<string>("");
  const [bountyDescription, setBountyDescription] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [rewardToken, setRewardToken] = useState<Token>();
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [branch, setBranch] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [activeBounty, setActiveBounty] = useState<boolean>(true);
  const [issueAmount, setIssueAmount] = useState<Amount>({
    value: "",
    formattedValue: "",
    floatValue: 0,
  });
  const [rewardAmount, setRewardAmount] = useState<Amount>({
    value: "",
    formattedValue: "",
    floatValue: 0,
  });
  const [isTokenApproved, setIsTokenApproved] =
    useState(false);
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const [tokenAllowance, setTokenAllowance] =
    useState<number>();
  const [coinInfo, setCoinInfo] = useState<TokenInfo>();
  const [rewardCoinInfo, setRewardCoinInfo] = useState<TokenInfo>();
  const [rewardChecked, setRewardChecked] = useState<boolean>(false);
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const defaultToken = activeNetwork?.networkToken || BEPRO_TOKEN;
  const canAddCustomToken =
    activeNetwork?.networkAddress === publicRuntimeConfig?.contract?.address
      ? publicRuntimeConfig?.networkConfig?.allowCustomTokens
      : !!activeNetwork?.allowCustomTokens;

  const steps = ["details", "bounty", "additional details", "Review "];

  function verifyAmountBiggerThanBalance(): boolean {
    return !(issueAmount.floatValue > tokenBalance);
  }

  function handleIssueAmountBlurChange() {
    if (issueAmount.floatValue > tokenBalance) {
      setIssueAmount({ formattedValue: tokenBalance.toString() });
    }
  }

  function handleRewardAmountBlurChange() {
    if (rewardAmount.floatValue > tokenBalance) {
      setRewardAmount({ formattedValue: tokenBalance.toString() });
    }
  }

  function onUpdateFiles(files: IFilesProps[]) {
    return setFiles(files);
  }

  function addFilesInDescription(str) {
    const strFiles = files?.map((file) =>
        file.uploaded &&
        `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
          publicRuntimeConfig?.ipfsUrl
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  function handleIssueAmountOnValueChange(values: Amount,
                                          type: "reward" | "issue") {
    if (values.floatValue < 0 || values.value === "-") {
      type === "reward" && setRewardAmount({ formattedValue: "" });
      type === "issue" && setIssueAmount({ formattedValue: "" });
    } else {
      type === "reward" && setRewardAmount(values);
      type === "issue" && setIssueAmount(values);
    }
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
  }

  async function getCoinInfo(address: string,
                             type: "transactional" | "reward") {
    await getCoinInfoByContract(address)
      .then((tokenInfo) => {
        type === "transactional" && setCoinInfo(tokenInfo);
        type === "reward" && setRewardCoinInfo(tokenInfo);
      })
      .catch((err) => {
        console.error("CoinInfo ", err);
        type === "transactional" && setCoinInfo(null);
        type === "reward" && setRewardCoinInfo(null);
      });
  }

  function renderDetails(review = false) {
    return (
      <CreateBountyDetails
        bountyTitle={bountyTitle}
        setBountyTitle={setBountyTitle}
        bountyDescription={bountyDescription}
        setBountyDescription={setBountyDescription}
        onUpdateFiles={onUpdateFiles}
        review={review}
      />
    );
  }

  function renderBountyToken(review = false) {
    return (
      <CreateBountyTokenAmount
        currentToken={transactionalToken}
        setCurrentToken={setTransactionalToken}
        customTokens={customTokens}
        userAddress={wallet?.address}
        defaultToken={defaultToken}
        canAddCustomToken={canAddCustomToken}
        addToken={addToken}
        issueAmount={issueAmount}
        setIssueAmount={setIssueAmount}
        handleAmountOnValueChange={(e) =>
          handleIssueAmountOnValueChange(e, "issue")
        }
        handleAmountBlurChange={handleIssueAmountBlurChange}
        tokenBalance={tokenBalance}
        coinInfo={coinInfo}
        activeBounty={activeBounty}
        labelSelect="set Bounty Token"
        review={review}
      />
    );
  }

  function renderRewardToken(review = false) {
    return (
      <CreateBountyTokenAmount
        currentToken={rewardToken}
        setCurrentToken={setRewardToken}
        customTokens={customTokens}
        userAddress={wallet?.address}
        defaultToken={defaultToken}
        canAddCustomToken={canAddCustomToken}
        addToken={addToken}
        issueAmount={rewardAmount}
        setIssueAmount={setRewardAmount}
        handleAmountOnValueChange={(e) =>
          handleIssueAmountOnValueChange(e, "reward")
        }
        handleAmountBlurChange={handleRewardAmountBlurChange}
        tokenBalance={rewardBalance}
        coinInfo={rewardCoinInfo}
        activeBounty={activeBounty}
        labelSelect="set Reward Token"
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
                  activeBounty && "active-bounty"
                }`}
                onClick={() => {
                  setActiveBounty(true);
                  setRewardChecked(false);
                  setRewardAmount({ formattedValue: "" });
                }}
              >
                <span className="">Bounty</span>
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                color="black"
                className={`container-bounty w-100 bg-30-hover ${
                  !activeBounty && "active-bounty"
                }`}
                onClick={() => setActiveBounty(false)}
              >
                <span className="">Funding Request</span>
              </Button>
            </div>
            {renderBountyToken()}
            {!activeBounty && (
              <>
                <div className="col-md-12">
                  <FormCheck
                    className="form-control-md pb-0"
                    type="checkbox"
                    label="Reward Funders"
                    onChange={handleRewardChecked}
                    checked={rewardChecked}
                  />
                </div>
                {rewardChecked && (
                  <div className="col-md-12">{renderRewardToken()}</div>
                )}
              </>
            )}
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
                  setRepository(opt.value);
                  setBranch(null);
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
                onSelected={(opt) => setBranch(opt.value)}
                value={{
                  label: branch,
                  value: branch,
                }}
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
          {renderBountyToken(true)}
          {rewardChecked && renderRewardToken(true)}
          <div className="row">
            <div className="col-md-6">
              <label className="caption-small mb-2">Repository</label>
              <GithubInfo
                parent="list"
                variant="repository"
                label={repository?.path}
                simpleDisabled={true}
              />
            </div>
            <div className="col-md-6">
              <label className="caption-small mb-2">Branch</label>
              <GithubInfo
                parent="list"
                variant="repository"
                label={branch}
                simpleDisabled={true}
              />
            </div>
          </div>
        </>
      );
    }
  }

  function addToken(newToken: Token) {
    setCustomTokens([...customTokens, newToken]);
  }

  function handleNextStepAndCreate() {
    currentSection + 1 < steps.length &&
      setCurrentSection((prevState) => prevState + 1);
    if(currentSection === 3){
      createIssue()
    }  
  }

  function verifyNextStepAndCreate() {
    const isIssueAmount =
      issueAmount.floatValue <= 0 || issueAmount.floatValue === undefined
        ? true
        : false;
    const isRewardAmount =
      rewardAmount.floatValue <= 0 || rewardAmount.floatValue === undefined
        ? true
        : false;
    if ((currentSection === 0 && !bountyTitle) || !bountyDescription)
      return true;
    if (currentSection === 1 && activeBounty && isIssueAmount) return true;
    if (currentSection === 1 && !activeBounty && isRewardAmount) return true;
    if (currentSection === 2 && !repository && !branch) return true;
    if (currentSection === 3 && !isTokenApproved) return true;

    return false;
  }

  function handleCancelAndBack() {
    if (currentSection === 0) {
      cleanFields()
      setShow(false);
    } else {
      setCurrentSection((prevState) => prevState - 1);
    }
  }

  function setProgressBar() {
    const progress = [0, 30, 60, 100];
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])]);
  }

  function updateWalletByToken(token: Token, setBalance: Dispatch<SetStateAction<number>>) {
    DAOService.getTokenBalance(token.address, wallet.address).then(setBalance);

    DAOService.getAllowance(token.address,
                            wallet.address,
                            DAOService.network.contractAddress).then(setTokenAllowance);
  }

  function handleTokens(token: Token, 
                        setToken: Dispatch<SetStateAction<Token>>, 
                        setBalance: Dispatch<SetStateAction<number>>) 
                        {
    if (!wallet?.balance || !DAOService) return;
    if (!token) return setToken(BEPRO_TOKEN);

    updateWalletByToken(token, setBalance);
  }

  useEffect(() => {
    handleTokens(transactionalToken, setTransactionalToken, setTokenBalance)
  }, [transactionalToken, wallet, DAOService]);

  useEffect(() => {
    handleTokens(rewardToken, setRewardToken, setRewardBalance)
  }, [rewardToken, wallet, DAOService]);

  function cleanFields() {
    setBountyTitle("");
    setBountyDescription("");
    setIssueAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setRewardAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setRepository(undefined);
    setBranch("");
    setCurrentSection(0)
  }



  useEffect(() => {
    if (!activeNetwork?.networkToken) return;

    const tmpTokens = [];

    tmpTokens.push(BEPRO_TOKEN);

    if (activeNetwork.networkAddress !== publicRuntimeConfig?.contract?.address)
      tmpTokens.push(activeNetwork.networkToken);

    tmpTokens.push(...activeNetwork.tokens.map(({ name, symbol, address }) => ({ name, symbol, address } as Token)));

    setCustomTokens(tmpTokens);
  }, [activeNetwork?.networkToken]);

  useEffect(() => {
    setProgressBar();
  }, [currentSection]);

  useEffect(() => {
    transactionalToken?.address &&
      getCoinInfo(transactionalToken.address, "transactional");
  }, [transactionalToken]);

  useEffect(() => {
    rewardToken?.address && getCoinInfo(rewardToken.address, "reward");
  }, [rewardToken]);

  const isAmountApproved = (tokenAllowance: number, amount: number) =>
  tokenAllowance >= amount;

  useEffect(() => {
    activeBounty && setIsTokenApproved(isAmountApproved(tokenAllowance, issueAmount.floatValue));
    !activeBounty && setIsTokenApproved(isAmountApproved(tokenAllowance, rewardAmount.floatValue));
  }, [tokenAllowance, issueAmount.floatValue, rewardAmount.floatValue]);

  async function allowCreateIssue() {
    if (!DAOService || !transactionalToken || issueAmount.floatValue <= 0)
      return;

    if(rewardChecked && rewardToken?.address && rewardAmount.floatValue > 0){
      handleApproveToken(rewardToken.address, rewardAmount.floatValue).then(() => {
        updateWalletByToken(rewardToken, setRewardBalance);
      });
    }else {
      handleApproveToken(transactionalToken.address, issueAmount.floatValue).then(() => {
        updateWalletByToken(transactionalToken, setTokenBalance);
      });
    }

  }

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!myTransactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  const isApproveButtonDisabled = (): boolean =>
    [
      !isTokenApproved,
      !verifyTransactionState(TransactionTypes.approveTransactionalERC20Token),
    ].some((value) => value === false);

  async function createIssue() {
    if (!repository || !transactionalToken || !DAOService || !wallet) return;

    const payload = {
      title: bountyTitle,
      body: addFilesInDescription(bountyDescription),
      amount: issueAmount.floatValue,
      creatorAddress: wallet.address,
      creatorGithub: user?.login,
      repositoryId: repository?.id,
      branch,
    };

    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, 
                                         amount: payload.amount, },
                                       activeNetwork);


    const cid = await createPreBounty({
        title: payload.title,
        body: payload.body,
        creator: payload.creatorGithub,
        repositoryId: payload.repositoryId,
    },
                                      activeNetwork?.name)
      .then((cid) => cid)
      .catch(() => {

        dispatch(toastError(t("create-bounty:errors.creating-bounty")));

        return false;
      });
    if (!cid) return;

    dispatch(openIssueTx);

    const chainPayload: chainPayload = {
      cid,
      title: payload.title,
      repoPath: repository.path,
      branch,
      transactional: transactionalToken.address,
      tokenAmount: payload.amount,
      githubUser: payload.creatorGithub,
    };

    if(rewardChecked){
      chainPayload.tokenAmount = 0
      chainPayload.rewardAmount = rewardAmount.floatValue
      chainPayload.rewardToken = rewardToken.address
      chainPayload.fundingAmount = issueAmount.floatValue
    }

    const txInfo = await DAOService.openBounty(chainPayload).catch((e) => {
      cleanFields();
      if (e?.message?.toLowerCase().search("user denied") > -1)
        dispatch(updateTransaction({
            ...(openIssueTx.payload as BlockTransaction),
            status: TransactionStatus.rejected,
        }));
      else
        dispatch(updateTransaction({
            ...(openIssueTx.payload as BlockTransaction),
            status: TransactionStatus.failed,
        }));

      console.log("Failed to create bounty on chain", e);

      dispatch(toastError(e.message || t("create-bounty:errors.creating-bounty")));
      return false;
    });

    if (!txInfo) return;

    txWindow.updateItem(openIssueTx.payload.id,
                        parseTransaction(txInfo, openIssueTx.payload));

    const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

    const createdBounties = await processEvent("bounty",
                                               "created",
                                               activeNetwork?.name,
      { fromBlock })
      .then(({ data }) => data)
      .catch((error) => {
        console.log("Failed to patch bounty", error);

        return false;
      });

    if (!createdBounties)
      return dispatch(toastWarning(t("create-bounty:errors.sync")));

    if (createdBounties.includes(cid)) {
      const [repoId, githubId] = String(cid).split("/");

      router.push(getURLWithNetwork("/bounty", {
          id: githubId,
          repoId,
      })) 
      setShow(false)
      cleanFields()
    }
  }

  return (
    <>
      <Button
        className="flex-grow-1"
        textClass="text-uppercase text-white"
        onClick={() => setShow(true)}
      >
        <span>Create Bounty</span>
      </Button>
      <Modal
        show={show}
        title={"Create Bounty"}
        titlePosition="center"
        onCloseClick={() => {
          cleanFields()
          setShow(false);
          setRewardChecked(false);
        }}
        footer={
          <>
            <div className="d-flex flex-grow-1">
              <Button color="dark-gray" onClick={handleCancelAndBack}>
                <span>
                  {currentSection === 0 ? t("common:actions.cancel") : "back"}
                </span>
              </Button>
            </div>
            {!isTokenApproved && currentSection === 3 ? (
              <ReadOnlyButtonWrapper>
                <Button
                  className="me-3 read-only-button"
                  disabled={isApproveButtonDisabled()}
                  onClick={allowCreateIssue}
                >
                  {t("actions.approve")}
                </Button>
              </ReadOnlyButtonWrapper>
            ) : null}

            <Button
              className="d-flex flex-shrink-0 w-40 btn-block"
              onClick={handleNextStepAndCreate}
              disabled={verifyNextStepAndCreate()}
            >
              <span>
                {currentSection !== 3 ? "Next Step" : t(" :create-bounty")}
              </span>
            </Button>
          </>
        }
      >
        <>
          <CreateBountyProgress
            steps={steps}
            currentSection={currentSection}
            progressPercentage={progressPercentage}
          />
          {renderCurrentSection()}
        </>
      </Modal>
    </>
  );
}
