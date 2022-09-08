import {
  useContext,
  useEffect,
  useState,
} from "react";
import { FormCheck } from "react-bootstrap";
import { NumberFormatValues } from "react-number-format";

import { useTranslation } from "next-i18next";
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
import { useSettings } from "contexts/settings";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Token } from "interfaces/token";
import { BlockTransaction } from "interfaces/transaction";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";
import useNetworkTheme from "x-hooks/use-network";
import useTransactions from "x-hooks/useTransactions";

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

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "bounty"]);

  const [branch, setBranch] = useState("");
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [rewardToken, setRewardToken] = useState<Token>();
  const [bountyTitle, setBountyTitle] = useState<string>("");
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isFundingType, setIsFundingType] = useState<boolean>(true);
  const [rewardChecked, setRewardChecked] = useState<boolean>(false);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [bountyDescription, setBountyDescription] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] = useState<boolean>(false);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);

  const rewardERC20 = useERC20();
  const txWindow = useTransactions();
  const { settings } = useSettings();
  const transactionalERC20 = useERC20();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { handleApproveToken } = useBepro();
  const { wallet, user } = useAuthentication();
  const { getURLWithNetwork } = useNetworkTheme();
  const { createPreBounty, processEvent } = useApi();

  const {
    dispatch,
    state: { myTransactions, showCreateBounty },
  } = useContext(ApplicationContext);
  

  const canAddCustomToken =
    activeNetwork?.networkAddress === settings?.contracts?.network
      ? settings?.defaultNetworkConfig?.allowCustomTokens
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
          settings?.urls?.ipfs
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
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
    const fieldParams = {
      bounty: {
        token: transactionalToken,
        setToken: setTransactionalToken,
        default: transactionalToken,
        decimals: transactionalERC20?.decimals,
        amount: issueAmount,
        setAmount: setIssueAmount,
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
        balance: rewardERC20.balance,
        isFunding: true,
        label: t("bounty:fields.select-token.reward", { set: review ? "" : t("bounty:fields.set") })
      }
    };

    return (
      <CreateBountyTokenAmount
        currentToken={fieldParams[type].token}
        setCurrentToken={fieldParams[type].setToken}
        customTokens={customTokens}
        userAddress={wallet?.address}
        defaultToken={review && fieldParams[type].default}
        canAddCustomToken={canAddCustomToken}
        addToken={addToken}
        decimals={fieldParams[type].decimals}
        issueAmount={fieldParams[type].amount}
        setIssueAmount={fieldParams[type].setAmount}
        tokenBalance={fieldParams[type].balance}
        isFundingType={fieldParams[type].isFunding}
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
                  isFundingType && "funding-type"
                }`}
                onClick={() => {
                  setIsFundingType(true);
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
                  !isFundingType && "funding-type"
                }`}
                onClick={() => {
                  setIsFundingType(false);
                  setRewardChecked(true);
                  setIssueAmount(ZeroNumberFormatValues);
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
                fromBountyCreation
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
                    label={branch.length <= 20 ? branch : branch.slice(0,20)+"..."}
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

  function cleanFields() {
    setBountyTitle("");
    setBountyDescription("");
    setIssueAmount(ZeroNumberFormatValues);
    setRewardAmount(ZeroNumberFormatValues);
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

  const isAmountApproved = (tokenAllowance: number, amount: number) => tokenAllowance >= amount;

  async function allowCreateIssue() {
    if (!DAOService || !transactionalToken || issueAmount.floatValue <= 0)
      return;
    setIsLoadingApprove(true)

    if (rewardChecked && rewardToken?.address && rewardAmount.floatValue > 0) {
      handleApproveToken(rewardToken.address, rewardAmount.floatValue)
        .then(() => {
          return rewardERC20.updateAllowanceAndBalance();
        })
        .finally(() => setIsLoadingApprove(false))
    } else {
      handleApproveToken(transactionalToken.address, issueAmount.floatValue)
        .then(() => {
          return transactionalERC20.updateAllowanceAndBalance();
        })
        .finally(() => setIsLoadingApprove(false));
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

    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, amount: payload.amount }, activeNetwork);

    const cid = await createPreBounty({
        title: payload.title,
        body: payload.body,
        creator: payload.creatorGithub,
        repositoryId: payload.repositoryId,
    }, activeNetwork?.name)
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

    const createdBounties = await processEvent("bounty", "created", activeNetwork?.name, { fromBlock })
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

  useEffect(() => {
    if (transactionalToken?.address) transactionalERC20.setAddress(transactionalToken.address);
  }, [transactionalToken, wallet, DAOService]);

  useEffect(() => {
    if (rewardToken?.address) rewardERC20.setAddress(rewardToken.address);
  }, [rewardToken, wallet, DAOService]);

  useEffect(() => {
    setIssueAmount(ZeroNumberFormatValues);
  }, [transactionalToken]);

  useEffect(() => {
    setRewardAmount(ZeroNumberFormatValues);
  }, [rewardToken]);

  useEffect(() => {
    setProgressBar();
  }, [currentSection]);

  useEffect(() => {
    if(customTokens?.length === 1) {
      setTransactionalToken(customTokens[0])
      setRewardToken(customTokens[0])
    }
  }, [customTokens]);

  useEffect(() => {
    if (isFundingType)
      setIsTokenApproved(isAmountApproved(transactionalERC20.allowance, issueAmount.floatValue));
    else
      setIsTokenApproved(isAmountApproved(rewardERC20.allowance, rewardAmount.floatValue));
  }, [transactionalERC20.allowance, rewardERC20.allowance, issueAmount.floatValue, rewardAmount.floatValue]);

  useEffect(() => {
    if (!activeNetwork?.networkToken || !settings?.contracts?.settlerToken) return;

    const tmpTokens = [];
    const beproToken = {
      address: settings.contracts.settlerToken,
      name: "Bepro Network",
      symbol: "BEPRO"
    };

    tmpTokens.push(beproToken);

    if (activeNetwork.networkToken.address.toLowerCase() !== beproToken?.address?.toLowerCase())
      tmpTokens.push(activeNetwork.networkToken);

    tmpTokens.push(...activeNetwork.tokens.map(({ name, symbol, address }) => ({ name, symbol, address } as Token)));

    getTokenInfo(tmpTokens);
  }, [activeNetwork?.networkToken, settings]);

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
