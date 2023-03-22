import { useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";
import { NumberFormatValues } from "react-number-format";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router, { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import CheckCircle from "assets/icons/check-circle";

import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import CreateBountyCard from "components/create-bounty/create-bounty-card";
import CreateBountyDetails from "components/create-bounty/create-bounty-details";
import CreateBountyReview from "components/create-bounty/create-bounty-review";
import CreateBountyRewardInfo from "components/create-bounty/create-bounty-reward-info";
import CreateBountySteps from "components/create-bounty/create-bounty-steps";
import CreateBountyTokenAmount from "components/create-bounty/create-bounty-token-amount";
import SelectNetwork from "components/create-bounty/select-network";
import SelectNetworkDropdown from "components/create-bounty/select-network-dropdown";
import CustomContainer from "components/custom-container";
import { IFilesProps } from "components/drag-and-drop";
import Modal from "components/modal";

import { useAppState } from "contexts/app-state";
import { toastError, toastWarning } from "contexts/reducers/change-toaster";
import { addTx, updateTx } from "contexts/reducers/change-tx-list";

import { BODY_CHARACTERES_LIMIT } from "helpers/contants";
import { parseTransaction } from "helpers/transactions";

import { BountyPayload } from "interfaces/create-bounty";
import { MetamaskErrors } from "interfaces/enums/Errors";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Network } from "interfaces/network";
import { ReposList } from "interfaces/repos-list";
import { Token } from "interfaces/token";
import { SimpleBlockTransactionPayload } from "interfaces/transaction";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useDao } from "x-hooks/use-dao";
import useERC20 from "x-hooks/use-erc20";
import { useNetwork } from "x-hooks/use-network";
import useOctokit from "x-hooks/use-octokit";

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

export default function CreateBountyPage() {
  const { t } = useTranslation(["common", "bounty"]);
  const [branch, setBranch] = useState<
    { value: string; label: string } | undefined
  >();
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
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [repositories, setRepositories] = useState<ReposList>();
  const [branches, setBranches] = useState<string[]>();
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] =
    useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<Network>();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [showModalSuccess, setShowModalSuccess] = useState<boolean>(false);
  const [currentCid, setCurrentCid] = useState<string>("");

  const { query } = useRouter();

  const rewardERC20 = useERC20();

  const transactionalERC20 = useERC20();

  const { searchNetworks, getReposList, createPreBounty, processEvent } =
    useApi();

  const { getURLWithNetwork } = useNetwork();

  const { handleApproveToken } = useBepro();
  const { changeNetwork } = useDao();

  const { getRepositoryBranches } = useOctokit();

  const {
    dispatch,
    state: { transactions, Settings, Service, currentUser },
  } = useAppState();

  const steps = [
    "Select network",
    "Bounty details",
    "Reward Information",
    "Review",
  ];

  const isAmountApproved = (tokenAllowance: BigNumber, amount: BigNumber) =>
    !tokenAllowance.lt(amount);

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

  function verifyNextStepAndCreate() {
    if (isLoadingCreateBounty) return true;

    const isIssueAmount =
      issueAmount.floatValue <= 0 || issueAmount.floatValue === undefined;
    const isRewardAmount =
      rewardAmount.floatValue <= 0 || rewardAmount.floatValue === undefined;

    if (currentSection === 0 && !currentNetwork) return true;

    if (
      currentSection === 1 &&
      (!bountyTitle ||
        !bountyDescription ||
        isUploading ||
        addFilesInDescription(bountyDescription).length >
          BODY_CHARACTERES_LIMIT ||
        bountyTitle.length >= 131)
    )
      return true;

    if (currentSection === 1 && (!repository || !branch)) return true;

    if (currentSection === 2 && !isFundingType && isIssueAmount) return true;
    if (
      currentSection === 2 &&
      isFundingType &&
      !rewardChecked &&
      isIssueAmount
    )
      return true;
    if (currentSection === 2 && isFundingType && rewardChecked && isIssueAmount)
      return true;
    if (
      currentSection === 2 &&
      isFundingType &&
      rewardChecked &&
      isRewardAmount
    )
      return true;

    if (
      currentSection === 2 &&
      isKyc &&
      Settings?.kyc?.tierList?.length &&
      !tierList.length
    )
      return true;

    if (currentSection === 3 && !isTokenApproved) return true;

    return currentSection === 3 && isLoadingCreateBounty;
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
    if (!repository || !transactionalToken || !Service?.active || !currentUser)
      return;

    setIsLoadingCreateBounty(true);

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
          tags: selectedTags,
          isKyc: !isFundingType ? isKyc : false,
          tierList: !isFundingType ? tierList : null,
      },
                                        currentNetwork?.name).then((cid) => cid);

      if (!cid) {
        return dispatch(toastError(t("bounty:errors.creating-bounty")));
      }

      const transactionToast = addTx([
        {
          type: TransactionTypes.openIssue,
          amount: payload.amount,
          network: currentNetwork,
        },
      ]);

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

      if (isFundingType && !rewardChecked) {
        bountyPayload.tokenAmount = "0";
        bountyPayload.fundingAmount = issueAmount.value;
      }

      if (rewardChecked) {
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
            parseTransaction(networkBounty,
                             transactionToast.payload[0] as SimpleBlockTransactionPayload),
        ]));

        const createdBounty = await processEvent("bounty",
                                                 "created",
                                                 currentNetwork?.name,
          { fromBlock: networkBounty?.blockNumber });

        if (!createdBounty) {
          dispatch(toastWarning(t("bounty:errors.sync")));
        }

        if (createdBounty?.[cid]) {
          setCurrentCid(cid);
          setShowModalSuccess(true);
          router.push({
            pathname: "/create-bounty",
            query: {
              created: true,
            },
          });
        }

        cleanFields();
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
    setRepository(undefined);
    setBranch(null);
    setIsKyc(false);
    setTierList([]);
    setCurrentSection(0);
  }

  useEffect(() => {
    searchNetworks({
      isRegistered: true,
      sortBy: "name",
      order: "asc",
      isNeedCountsAndTokensLocked: true,
    })
      .then(async ({ count, rows }) => {
        if (count > 0) {
          setNetworks(rows);
        }
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      });
  }, []);

  useEffect(() => {
    if (transactionalToken?.address)
      transactionalERC20.setAddress(transactionalToken.address);
  }, [transactionalToken?.address, currentUser, Service?.active]);

  useEffect(() => {
    if (rewardToken?.address) rewardERC20.setAddress(rewardToken.address);
  }, [rewardToken?.address, currentUser, Service?.active]);

  useEffect(() => {
    if (customTokens?.length === 1) {
      setTransactionalToken(customTokens[0]);
      setRewardToken(customTokens[0]);
    }
  }, [customTokens]);

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
    if (currentNetwork && currentSection === 1) {
      getReposList(true, currentNetwork.name).then(setRepositories);
    }
  }, [currentNetwork, currentSection]);

  useEffect(() => {
    if (repository) {
      getRepositoryBranches(repository.path, true).then((b) =>
        setBranches(b.branches));
    }
  }, [repository]);

  useEffect(() => {
    if (!currentNetwork) return;
    changeNetwork(currentNetwork?.networkAddress);

    if (!currentNetwork?.tokens) return;
    setCustomTokens(currentNetwork?.tokens);
  }, [currentNetwork]);

  useEffect(() => {
    //cleanFields();
    transactionalERC20.updateAllowanceAndBalance();
    rewardERC20.updateAllowanceAndBalance();
  }, []);

  function section() {
    if (currentSection === 0)
      return (
        <SelectNetwork>
          <SelectNetworkDropdown
            value={currentNetwork}
            networks={networks}
            onSelect={setCurrentNetwork}
          />
        </SelectNetwork>
      );

    if (currentSection === 1)
      return (
        <CreateBountyDetails
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
          repository={repository}
          updateRepository={setRepository}
          branch={branch}
          updateBranch={setBranch}
          repositories={repositories}
          branches={branches}
          updateUploading={setIsUploading}
        />
      );

    if (currentSection === 2)
      return (
        <>
          <CreateBountyRewardInfo
            isFunding={isFundingType}
            updateIsFunding={(e: boolean) => {
              if (e === true) setIssueAmount(ZeroNumberFormatValues);
              else {
                setIssueAmount(ZeroNumberFormatValues);
                setRewardAmount(ZeroNumberFormatValues);
              }

              setIsFundingType(e);
            }}
          >
            {renderBountyToken("bounty")}
            {isFundingType && (
              <div className="col-md-12 my-4">
                <FormCheck
                  className="form-control-md pb-0"
                  type="checkbox"
                  label={t("bounty:reward-funders")}
                  onChange={handleRewardChecked}
                  checked={rewardChecked}
                />
                <p className="ms-4 text-gray">
                  Reward anyone who funds this bounty.
                </p>
              </div>
            )}
            {rewardChecked && isFundingType && renderBountyToken("reward")}
          </CreateBountyRewardInfo>
        </>
      );

    if (currentSection === 3)
      return (
        <CreateBountyReview
          payload={{
            network: currentNetwork?.name,
            title: bountyTitle,
            description: addFilesInDescription(bountyDescription),
            tags: selectedTags && selectedTags,
            repository: repository?.path?.split("/")[1],
            branch: branch?.label,
            reward: `${issueAmount.value} ${transactionalToken?.symbol}`,
            funders_reward:
              rewardAmount.value &&
              `${rewardAmount.value} ${rewardToken?.symbol}`,
          }}
        />
      );
  }

  function renderBountyToken(type: "bounty" | "reward") {
    const fieldParams = {
      bounty: {
        token: transactionalToken,
        setToken: setTransactionalToken,
        default: transactionalToken,
        decimals: transactionalERC20?.decimals,
        amount: issueAmount,
        setAmount: setIssueAmount,
        tokens: customTokens.filter((token) => !!token?.network_tokens?.isTransactional),
        balance: transactionalERC20.balance,
        isFunding: isFundingType,
        label: t("bounty:fields.select-token.bounty", {
          set: t("bounty:fields.set"),
        }),
      },
      reward: {
        token: rewardToken,
        setToken: setRewardToken,
        default: rewardToken,
        decimals: transactionalERC20?.decimals,
        amount: rewardAmount,
        setAmount: setRewardAmount,
        tokens: customTokens.filter((token) => !!token?.network_tokens?.isReward),
        balance: rewardERC20.balance,
        isFunding: isFundingType,
        label: t("bounty:fields.select-token.reward", {
          set: t("bounty:fields.set"),
        }),
      },
    };

    return (
      <>
        <CreateBountyTokenAmount
          currentToken={fieldParams[type].token}
          setCurrentToken={fieldParams[type].setToken}
          customTokens={fieldParams[type].tokens}
          userAddress={currentUser?.walletAddress}
          defaultToken={fieldParams[type].default}
          canAddCustomToken={false}
          addToken={addToken}
          decimals={fieldParams[type].decimals}
          issueAmount={fieldParams[type].amount}
          setIssueAmount={fieldParams[type].setAmount}
          tokenBalance={fieldParams[type].balance}
          needValueValidation={!isFundingType || type === "reward"}
          isFunding={isFundingType}
          labelSelect={fieldParams[type].label}
        />
      </>
    );
  }

  if (!currentUser?.walletAddress)
    return <ConnectWalletButton asModal={true} />;

  return (
    <>
      {!(query?.created?.toString() === "true") && (
        <>
          <CustomContainer>
            <CreateBountySteps steps={steps} currentSection={currentSection} />
          </CustomContainer>
          <CustomContainer>
            <CreateBountyCard
              maxSteps={steps?.length}
              currentStep={currentSection + 1}
            >
              {section()}
            </CreateBountyCard>
          </CustomContainer>
          {currentSection === 3 && (
            <div className="d-flex justify-content-center col-12 mt-4">
              <p>
                By creating this bounty you agree to our{" "}
                <a href="https://www.bepro.network/terms" target="_blank">
                  terms and conditions.
                </a>
              </p>
            </div>
          )}
          <CustomContainer>
            <div className="d-flex justify-content-between mt-4 me-4">
              <Button
                className="col-6 bounty-outline-button me-3"
                upperCase={false}
                onClick={() => {
                  currentSection !== 0 &&
                    setCurrentSection((prevState) => prevState - 1);
                }}
              >
                Back
              </Button>

              {!isTokenApproved && currentSection === 3 ? (
                <Button
                  className="col-6 bounty-button"
                  disabled={isApproveButtonDisabled()}
                  onClick={allowCreateIssue}
                  isLoading={isLoadingApprove}
                >
                  {t("actions.approve")}
                </Button>
              ) : (
                <Button
                  className="col-6 bounty-button"
                  disabled={verifyNextStepAndCreate()}
                  isLoading={isLoadingCreateBounty}
                  onClick={() => {
                    if (currentSection + 1 < steps.length)
                      setCurrentSection((prevState) => prevState + 1);
                    if (currentSection === 3) {
                      createBounty();
                    }
                  }}
                >
                  {currentSection === 3 ? "Create Bounty" : "Next Step"}
                </Button>
              )}
            </div>
          </CustomContainer>
        </>
      )}
      <Modal
        show={showModalSuccess}
        footer={
          <div className="d-flex justify-content-center mb-2">
            <Button
              onClick={() => {
                const [repoId, githubId] = String(currentCid).split("/");

                router.push(getURLWithNetwork("/bounty", {
                    network: currentNetwork?.name,
                    id: githubId,
                    repoId,
                }));
              }}
            >
              <span>See Bounty</span>
            </Button>
          </div>
        }
      >
        <div className="d-flex flex-column text-center align-items-center">
          <CheckCircle />
          <span className="mt-1">Bounty created successfully!</span>
        </div>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "custom-network",
        "bounty",
        "connect-wallet-button",
      ])),
    },
  };
};
