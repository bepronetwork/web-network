import { useContext, useState } from "react";

import { ALLOW_CUSTOM_TOKENS, CONTRACT_ADDRESS, SETTLER_ADDRESS } from "env";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import LockedIcon from "assets/icons/locked-icon";

import BranchsDropdown from "components/branchs-dropdown";
import Button from "components/button";
import ConnectGithub from "components/connect-github";
import ConnectWalletButton from "components/connect-wallet-button";
import DragAndDrop, { IFilesProps } from "components/drag-and-drop";
import InputNumber from "components/input-number";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ReposDropdown from "components/repos-dropdown";
import TokensDropdown from "components/tokens-dropdown";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";
import { toastError } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Token } from "interfaces/token";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";
import useTransactions from "x-hooks/useTransactions";
const { publicRuntimeConfig } = getConfig()
interface Amount {
  value?: string;
  formattedValue: string;
  floatValue?: number;
}

const BEPRO_TOKEN: Token = {
  address: SETTLER_ADDRESS,
  name: "BEPRO",
  symbol: "$BEPRO"
};

export default function PageCreateIssue() {
  const router = useRouter();
  const { t } = useTranslation(["common", "create-bounty"]);

  const [branch, setBranch] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [repository, setRepository] = useState<{id: string, path: string}>();
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<Amount>({
    value: "",
    formattedValue: "",
    floatValue: 0
  });
  const [isTransactionalTokenApproved, setIsTransactionalTokenApproved] = useState(false);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [transactionalAllowance, setTransactionalAllowance] = useState<number>();
  const [customTokens, setCustomTokens] = useState<Token[]>([BEPRO_TOKEN]);
  
  const { activeNetwork } = useNetwork();
  const { handleApproveTransactionalToken } = useBepro()
  const { wallet, user, beproServiceStarted, updateIsApprovedSettlerToken } = useAuthentication();
  const {
    dispatch,
    state: { myTransactions }
  } = useContext(ApplicationContext);
  
  const [tokenBalance, setTokenBalance] = useState(0);

  const txWindow = useTransactions();
  const { getURLWithNetwork } = useNetworkTheme();
  const { createPreBounty, processEvent } = useApi();

  async function allowCreateIssue() {
    if (!beproServiceStarted || !transactionalToken || issueAmount.floatValue <= 0) return;

    handleApproveTransactionalToken(transactionalToken.address, issueAmount.floatValue);
  }

  function cleanFields() {
    setIssueTitle("");
    setIssueDescription("");
    setIssueAmount({ value: "0", formattedValue: "0", floatValue: 0 });
  }

  function addToken(newToken: Token) {
    setCustomTokens([
      ...customTokens,
      newToken
    ]);
  }
  
  function addFilesInDescription(str) {
    const strFiles = files?.map((file) =>
        file.uploaded &&
        `${file?.type?.split("/")[0] === "image" ? "!" : ""}[${file.name}](${
          publicRuntimeConfig.ipfsUrl
        }/${file.hash}) \n\n`);
    return `${str}\n\n${strFiles
      .toString()
      .replace(",![", "![")
      .replace(",[", "[")}`;
  }

  async function createIssue() {
    if (!repository || !transactionalToken) return;

    const payload = {
      title: issueTitle,
      body: addFilesInDescription(issueDescription),
      amount: issueAmount.floatValue,
      creatorAddress: BeproService.address,
      creatorGithub: user?.login,
      repositoryId: repository?.id,
      branch
    };

    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, amount: payload.amount },
                                       activeNetwork);

    setRedirecting(true);

    let issueId = "";
    let tx = undefined;

    createPreBounty({ 
      title: payload.title,
      body: payload.body,
      creator: payload.creatorGithub,
      repositoryId: payload.repositoryId
    }, activeNetwork?.name)
      .then((cid) => {
        if (!cid) throw new Error(t("errors.creating-issue"));

        issueId = cid;

        dispatch(openIssueTx);

        const chainPayload = {
          cid,
          title: payload.title,
          repoPath: repository.path,
          branch,
          transactional: transactionalToken.address,
          tokenAmount: payload.amount,
          githubUser: payload.creatorGithub
        };

        return BeproService.openBounty(chainPayload)
      })
      .then((txInfo) => {
        tx = txInfo;

        const { blockNumber } = txInfo as any;

        return processEvent("bounty/created", blockNumber, undefined, undefined, activeNetwork?.name);
      })
      .then(({data: createdBounties}) => {
        if (createdBounties.includes(issueId)) {
          txWindow.updateItem(openIssueTx.payload.id, parseTransaction(tx, openIssueTx.payload));
          const [repoId, githubId] = issueId.split('/');

          router.push(getURLWithNetwork('/bounty', {
            id: githubId,
            repoId
          }));
        } else throw new Error("Bounty not created");
      })
      .catch((e) => {
        console.error("Failed to createIssue", e);
        cleanFields();
        if (e?.message?.toLowerCase().search("user denied") > -1)
          dispatch(updateTransaction({ ...(openIssueTx.payload as any), status: TransactionStatus.rejected }));
        else
          dispatch(updateTransaction({
              ...(openIssueTx.payload as any),
              status: TransactionStatus.failed
          }));

        dispatch(toastError(e.message || t("create-bounty:errors.creating-bounty")));
        return false;
      })
      .finally(() => setRedirecting(false));
  }

  const issueContentIsValid = (): boolean => !!issueTitle && !!issueDescription;

  const verifyAmountBiggerThanBalance = (): boolean =>
    !(issueAmount.floatValue > tokenBalance);

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!myTransactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  function isCreateButtonDisabled() {
    return [
      isTransactionalTokenApproved,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue,
      !verifyTransactionState(TransactionTypes.openIssue),
      !!repository?.id,
      !!branch,
      !redirecting
    ].some((value) => value === false);
  }

  const isApproveButtonDisabled = (): boolean =>
    [
      !isTransactionalTokenApproved,
      !verifyTransactionState(TransactionTypes.approveTransactionalERC20Token)
    ].some((value) => value === false);

  const handleIssueAmountBlurChange = () => {
    if (issueAmount.floatValue > tokenBalance) {
      setIssueAmount({ formattedValue: tokenBalance.toString() });
    }
  };

  const handleIssueAmountOnValueChange = (values: Amount) => {
    if (values.floatValue < 0 || values.value === "-") {
      setIssueAmount({ formattedValue: "" });
    } else {
      setIssueAmount(values);
    }
  };

  const onUpdateFiles = (files: IFilesProps[]) => setFiles(files);

  const updateWalletByToken = async (token: Token) => {
    setTokenBalance(await BeproService.getTokenBalance(token.address));
    setTransactionalAllowance(await BeproService.getAllowance(token.address));
  }

  const isAmountApproved = () => transactionalAllowance >= issueAmount.floatValue;

  useEffect(() => {
    if (!wallet?.balance) return;
    if (!transactionalToken) return setTransactionalToken(BEPRO_TOKEN);

    updateWalletByToken(transactionalToken);
  }, [transactionalToken, wallet]);

  useEffect(() => {
    setIsTransactionalTokenApproved(isAmountApproved());
  }, [transactionalAllowance, issueAmount.floatValue]);

  useEffect(() => {
    if (!activeNetwork) return;

    const tmpTokens = [];

    if (activeNetwork.networkAddress === CONTRACT_ADDRESS) tmpTokens.push(BEPRO_TOKEN);

    tmpTokens.push(...activeNetwork.tokens.map(({name, symbol, address}) => ({name, symbol, address} as Token)));

    setCustomTokens(tmpTokens);
  }, [activeNetwork]);

  return (
    <>
      <div className="banner">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="d-flex justify-content-center">
                <h2>{t("create-bounty:title")}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <ConnectWalletButton asModal={true} />
            <div className="content-wrapper mt-n4 mb-5">
              <h3 className="mb-4 text-white">{t("misc.details")}</h3>
              <div className="form-group mb-4">
                <label className="caption-small mb-2">
                  {t("create-bounty:fields.title.label")}
                </label>
                <input
                  type="text"
                  className="form-control rounded-lg"
                  placeholder={t("create-bounty:fields.title.placeholder")}
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                />
                <p className="p-small text-gray trans my-2">
                  {t("create-bounty:fields.title.tip")}
                </p>
              </div>
              <div className="form-group">
                <label className="caption-small mb-2">
                  {t("create-bounty:fields.description.label")}
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder={t("create-bounty:fields.description.placeholder")}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <DragAndDrop onUpdateFiles={onUpdateFiles} />
              </div>
              <div className="row mb-4">
                <div className="col">
                  <ReposDropdown
                    onSelected={(opt) => {
                      setRepository(opt.value);
                      setBranch(null);
                    }}
                  />
                </div>
                <div className="col">
                  <BranchsDropdown
                    repoId={repository?.id}
                    onSelected={(opt) => setBranch(opt.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <InputNumber
                    thousandSeparator
                    max={tokenBalance}
                    label={t("create-bounty:fields.amount.label", {token: transactionalToken?.symbol})}
                    symbol={transactionalToken?.symbol}
                    value={issueAmount.formattedValue}
                    placeholder="0"
                    onValueChange={handleIssueAmountOnValueChange}
                    onBlur={handleIssueAmountBlurChange}
                    helperText={
                      <>
                        {t("create-bounty:fields.amount.info", {
                          token: transactionalToken?.symbol,
                          amount: formatNumberToCurrency(tokenBalance,
                            { maximumFractionDigits: 18 })
                        })}
                        {isTransactionalTokenApproved && (
                          <span
                            className="caption-small text-primary ml-1 cursor-pointer text-uppercase"
                            onClick={() =>
                              setIssueAmount({
                                formattedValue:
                                tokenBalance.toString()
                              })
                            }
                          >
                            {t("create-bounty:fields.amount.max")}
                          </span>
                        )}
                      </>
                    }
                  />
                </div>
                
                <div className="col-6 mt-n2">
                  <TokensDropdown 
                    defaultToken={BEPRO_TOKEN} 
                    tokens={customTokens} 
                    canAddToken={
                      activeNetwork?.networkAddress === CONTRACT_ADDRESS ? 
                      ALLOW_CUSTOM_TOKENS :
                      !!activeNetwork?.allowCustomTokens
                    }
                    addToken={addToken} 
                    setToken={setTransactionalToken}
                  /> 
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center mt-4">
                {!user?.login ? (
                  <div className="mt-3 mb-0">
                    <ConnectGithub />
                  </div>
                ) : (
                  <>
                    {!isTransactionalTokenApproved && issueAmount.floatValue > 0 ? (
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
                    <ReadOnlyButtonWrapper>
                      <Button
                        disabled={isCreateButtonDisabled()}
                        className="read-only-button"
                        onClick={createIssue}
                      >
                        {isCreateButtonDisabled() && (
                          <LockedIcon className="mr-1" width={13} height={13} />
                        )}
                        <span>{t("create-bounty:create-bounty")}</span>
                      </Button>
                    </ReadOnlyButtonWrapper>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "create-bounty",
        "connect-wallet-button"
      ]))
    }
  };
};
