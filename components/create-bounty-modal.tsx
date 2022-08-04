import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { FormCheck } from "react-bootstrap";
import { NumberFormatValues } from "react-number-format";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";
import router from "next/router";

import BranchsDropdown from "components/branchs-dropdown";
import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import CreateBountyDetails from "components/create-bounty-details";
import CreateBountyProgress from "components/create-bounty-progress";
import CreateBountyTokenAmount from "components/create-bounty-token-amount";
import { IFilesProps } from "components/drag-and-drop";
import GithubInfo from "components/github-info";
import Modal from "components/modal"; 
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ReposDropdown from "components/repos-dropdown";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { toastError, toastWarning } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { changeShowCreateBountyState } from "contexts/reducers/change-show-create-bounty";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { handleNetworkAddress } from "helpers/custom-network";
import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BEPRO_TOKEN, Token } from "interfaces/token";
import { BlockTransaction } from "interfaces/transaction";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";
import useTransactions from "x-hooks/useTransactions";


const { publicRuntimeConfig } = getConfig();

interface BountyPayload {
  title: string;
  cid: string | boolean;
  repoPath: string;
  transactional: string;
  branch: string;
  githubUser: string;
  tokenAmount: number;
  rewardToken?: string;
  rewardAmount?: number;
  fundingAmount?: number;
}

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "bounty"]);
  const { activeNetwork } = useNetwork();
  const { getURLWithNetwork } = useNetworkTheme();
  const { handleApproveToken } = useBepro();
  const { createPreBounty, processEvent } = useApi();
  const txWindow = useTransactions();
  const {
    dispatch,
    state: { myTransactions, showCreateBounty },
  } = useContext(ApplicationContext);
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
  const [isFundingType, setIsFundingType] = useState<boolean>(true);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>({
    value: "",
    formattedValue: "",
    floatValue: 0,
  });
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>({
    value: "",
    formattedValue: "",
    floatValue: 0,
  });
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const [tokenAllowance, setTokenAllowance] = useState<number>();
  const [rewardChecked, setRewardChecked] = useState<boolean>(false);
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [defaultTokens, setDefaultTokens] = useState<{
    transactional: Token;
    reward: Token;
  }>({
    transactional: activeNetwork?.networkToken || BEPRO_TOKEN,
    reward: activeNetwork?.networkToken || BEPRO_TOKEN,
  });
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] = useState<boolean>(false);

  const canAddCustomToken =
    activeNetwork?.networkAddress === publicRuntimeConfig?.contract?.address
      ? publicRuntimeConfig?.networkConfig?.allowCustomTokens
      : !!activeNetwork?.allowCustomTokens;

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
          publicRuntimeConfig?.ipfsUrl
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
  }

  async function getCurrentValueDefaultToken(token: Token) {
    DAOService.getTokenBalance(token.address, wallet?.address).then((value) => {
      const newToken = { ...token, currentValue: value };
      setDefaultTokens({ transactional: newToken, reward: newToken });
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
        files={files}
      />
    );
  }

  function renderBountyToken(review = false, type: "bounty" | "reward") {
    return (
      <CreateBountyTokenAmount
        currentToken={type === "bounty" ? transactionalToken : rewardToken}
        setCurrentToken={
          type === "bounty" ? setTransactionalToken : setRewardToken
        }
        customTokens={customTokens}
        userAddress={wallet?.address}
        defaultToken={
          type === "bounty" ? defaultTokens.transactional : defaultTokens.reward
        }
        canAddCustomToken={canAddCustomToken}
        addToken={addToken}
        issueAmount={type === "bounty" ? issueAmount : rewardAmount}
        setIssueAmount={type === "bounty" ? setIssueAmount : setRewardAmount}
        tokenBalance={type === "bounty" ? tokenBalance : rewardBalance}
        isFundingType={type === "bounty" ? isFundingType : true}
        labelSelect={
          type === "bounty"
            ? t("bounty:fields.select-token.bounty", {
                set: review ? "" : t("bounty:fields.set"),
            })
            : t("bounty:fields.select-token.reward", {
                set: review ? "" : t("bounty:fields.set"),
            })
        }
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
                  isFundingType && "funding-type"
                }`}
                onClick={() => {
                  setIsFundingType(true);
                  setRewardChecked(false);
                  setRewardAmount({
                    value: "0",
                    formattedValue: "0",
                    floatValue: 0,
                  });
                  setIssueAmount({
                    value: "0",
                    formattedValue: "0",
                    floatValue: 0,
                  });
                }}
              >
                <span>{t("bounty:steps.bounty")}</span>
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                color="black"
                className={`container-bounty w-100 bg-30-hover ${
                  !isFundingType && "funding-type"
                }`}
                onClick={() => {
                  setIsFundingType(false);
                  setRewardChecked(true);
                  setIssueAmount({
                    value: "0",
                    formattedValue: "0",
                    floatValue: 0,
                  });
                }}
              >
                <span>{t("bounty:steps.funding")}</span>
              </Button>
            </div>
            {renderBountyToken(false, "bounty")}
            {!isFundingType && (
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
                  setBranch(null)
                  setRepository(opt.value);
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
          {renderBountyToken(true, "bounty")}
          {rewardChecked && renderBountyToken(true, "reward")}
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <label className="caption-small mb-2">
                  {t("bounty:review.repository")}
                </label>
                <GithubInfo
                  parent="list"
                  variant="repository"
                  label={repository?.path}
                  simpleDisabled={true}
                />
              </div>
              <div className="col-md-6">
                <label className="caption-small mb-2 ms-3">
                  {t("bounty:review.branch")}
                </label>
                <div className="ms-3">
                  <GithubInfo
                    parent="list"
                    variant="repository"
                    label={branch}
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
    await getCoinInfoByContract(newToken?.address)
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
      createIssue();
    }
  }

  //TODO: add some function
  function verifyNextStepAndCreate() {
    if (isLoadingCreateBounty) return true;
    
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
    if (currentSection === 1 && isFundingType && isIssueAmount) return true;
    if (
      currentSection === 1 &&
      !isFundingType &&
      !rewardChecked &&
      isIssueAmount
    )
      return true;
    if (
      currentSection === 1 &&
      !isFundingType &&
      rewardChecked &&
      isIssueAmount
    )
      return true;
    if (
      currentSection === 1 &&
      !isFundingType &&
      rewardChecked &&
      isRewardAmount
    )
      return true;
    if (currentSection === 2 && (!repository || !branch)) return true;
    if (currentSection === 3 && !isTokenApproved) return true;
    if (currentSection === 3 && isLoadingCreateBounty) return true;

    return false;
  }

  function handleCancelAndBack() {
    if (currentSection === 0) {
      cleanFields();
      dispatch(changeShowCreateBountyState(false))
    } else {
      setCurrentSection((prevState) => prevState - 1);
    }
  }

  function setProgressBar() {
    const progress = [0, 30, 60, 100];
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])]);
  }

  function updateWalletByToken(token: Token,
                               setBalance: Dispatch<SetStateAction<number>>) {
    DAOService.getTokenBalance(token.address, wallet.address).then(setBalance);

    DAOService.getAllowance(token.address,
                            wallet.address,
                            DAOService.network.contractAddress).then(setTokenAllowance);
  }

  function handleTokens(token: Token,
                        setToken: Dispatch<SetStateAction<Token>>,
                        setBalance: Dispatch<SetStateAction<number>>) {
    if (!wallet?.balance || !DAOService) return;
    if (!token) return setToken(BEPRO_TOKEN);

    updateWalletByToken(token, setBalance);
  }

  useEffect(() => {
    handleTokens(transactionalToken, setTransactionalToken, setTokenBalance);
  }, [transactionalToken, wallet, DAOService]);

  useEffect(() => {
    setIssueAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setDefaultTokens(({ reward }) => {
      return {
        reward,
        transactional: { ...transactionalToken, currentValue: tokenBalance },
      };
    });
  }, [transactionalToken]);

  useEffect(() => {
    setRewardAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setDefaultTokens(({ transactional }) => {
      return {
        transactional,
        reward: { ...rewardToken, currentValue: rewardBalance },
      };
    });
  }, [rewardToken]);

  useEffect(() => {
    handleTokens(rewardToken, setRewardToken, setRewardBalance);
  }, [rewardToken, wallet, DAOService]);

  useEffect(() => {
    if (DAOService && activeNetwork?.networkToken && wallet?.address) 
      getCurrentValueDefaultToken(activeNetwork?.networkToken);
  }, [DAOService, activeNetwork?.networkToken, wallet?.address]);

  useEffect(() => {
    setProgressBar();
  }, [currentSection]);

  useEffect(() => {
    if (!activeNetwork?.networkToken) return;

    const tmpTokens = [];

    tmpTokens.push(BEPRO_TOKEN);

    if (handleNetworkAddress(activeNetwork) !== publicRuntimeConfig?.contract?.address && 
      activeNetwork.networkToken.address.toLowerCase() !== BEPRO_TOKEN.address.toLowerCase())
      tmpTokens.push(activeNetwork.networkToken);

    tmpTokens.push(...activeNetwork.tokens.map(({ name, symbol, address }) => ({ name, symbol, address } as Token)));

    getTokenInfo(tmpTokens);
  }, [activeNetwork?.networkToken]);

  function cleanFields() {
    setBountyTitle("");
    setBountyDescription("");
    setIssueAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setRewardAmount({ value: "0", formattedValue: "0", floatValue: 0 });
    setRepository(undefined);
    setBranch("");
    setCurrentSection(0);
    setFiles([]);
  }

  async function getTokenInfo(tmpTokens: Token[]) {
    await Promise.all(tmpTokens.map(async (token) => {
      if (token?.address) {
        const Info = await getCoinInfoByContract(token.address).then((tokenInfo) => tokenInfo);
        return { ...token, tokenInfo: Info };
      } else {
        return token;
      }
    }))
      .then((tokens) => {
        setCustomTokens(tokens);
      })
      .catch(() => {
        setCustomTokens(tmpTokens);
      });
  }

  const isAmountApproved = (tokenAllowance: number, amount: number) =>
    tokenAllowance >= amount;

  useEffect(() => {
    isFundingType &&
      setIsTokenApproved(isAmountApproved(tokenAllowance, issueAmount.floatValue));
    !isFundingType &&
      setIsTokenApproved(isAmountApproved(tokenAllowance, rewardAmount.floatValue));
  }, [tokenAllowance, issueAmount.floatValue, rewardAmount.floatValue]);

  async function allowCreateIssue() {
    if (!DAOService || !transactionalToken || issueAmount.floatValue <= 0)
      return;
    setIsLoadingApprove(true)

    if (rewardChecked && rewardToken?.address && rewardAmount.floatValue > 0) {
      handleApproveToken(rewardToken.address, rewardAmount.floatValue).then(() => {
        updateWalletByToken(rewardToken, setRewardBalance);
      }).finally(() => setIsLoadingApprove(false))
    } else {
      handleApproveToken(transactionalToken.address,
                         issueAmount.floatValue).then(() => {
                           updateWalletByToken(transactionalToken, setTokenBalance);
                         }).finally(() => setIsLoadingApprove(false))
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
    setIsLoadingCreateBounty(true)
    const payload = {
      title: bountyTitle,
      body: addFilesInDescription(bountyDescription),
      amount: issueAmount.floatValue,
      creatorAddress: wallet.address,
      creatorGithub: user?.login,
      repositoryId: repository?.id,
      branch,
    };

    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, amount: payload.amount },
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
        dispatch(toastError(t("bounty:errors.creating-bounty")));
        setIsLoadingCreateBounty(false)
        return false;
      });
    if (!cid) return;

    dispatch(openIssueTx);

    const bountyPayload: BountyPayload = {
      cid,
      title: payload.title,
      repoPath: repository.path,
      branch,
      transactional: transactionalToken.address,
      tokenAmount: payload.amount,
      githubUser: payload.creatorGithub,
    };

    if (!isFundingType && !rewardChecked) {
      bountyPayload.tokenAmount = 0;
      bountyPayload.fundingAmount = issueAmount.floatValue;
    }

    if (rewardChecked) {
      bountyPayload.tokenAmount = 0;
      bountyPayload.rewardAmount = rewardAmount.floatValue;
      bountyPayload.rewardToken = rewardToken.address;
      bountyPayload.fundingAmount = issueAmount.floatValue;
    }

    const txInfo = await DAOService.openBounty(bountyPayload).catch((e) => {
      setIsLoadingCreateBounty(false)
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

      dispatch(toastError(e.message || t("bounty:errors.creating-bounty")));
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
        setIsLoadingCreateBounty(false)
        return false;
      });

    if (!createdBounties)
      return dispatch(toastWarning(t("bounty:errors.sync")));

    if (createdBounties.includes(cid)) {
      const [repoId, githubId] = String(cid).split("/");

      router.push(getURLWithNetwork("/bounty", {
          id: githubId,
          repoId,
      }));
      dispatch(changeShowCreateBountyState(false))
      cleanFields();
      setIsLoadingCreateBounty(false)
    }
  }

  if (showCreateBounty && !wallet?.address)
    return <ConnectWalletButton asModal={true} />;

  return (
    <>
      <Modal
        show={showCreateBounty && !!wallet?.address}
        title={t("bounty:title")}
        titlePosition="center"
        onCloseClick={() => {
          cleanFields();
          dispatch(changeShowCreateBountyState(false))
          setRewardChecked(false);
        }}
        onCloseDisabled={isLoadingApprove || isLoadingCreateBounty}
        footer={
          <>
            <div className="d-flex flex-row justify-content-between">
              <Button 
                color="dark-gray" 
                onClick={handleCancelAndBack} 
                disabled={isLoadingApprove || isLoadingCreateBounty}
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
