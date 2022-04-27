import { useContext, useState } from "react";

import { ERC20 } from "bepro-js";
import clsx from "clsx";
import { SETTLER_ADDRESS } from "env";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import LockedIcon from "assets/icons/locked-icon";

import BranchsDropdown from "components/branchs-dropdown";
import Button from "components/button";
import ChangeTokenModal from "components/change-token-modal";
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
  const [repository_id, setRepositoryId] = useState("");
  const [files, setFiles] = useState<IFilesProps[]>([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [issueAmount, setIssueAmount] = useState<Amount>({
    value: "",
    formattedValue: "",
    floatValue: 0
  });
  const [isTransactionalTokenApproved, setIsTransactionalTokenApproved] = useState(false);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
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
  const { createIssue: apiCreateIssue, patchIssueWithScId } = useApi();

  async function allowCreateIssue() {
    if (!beproServiceStarted || !transactionalToken) return;
    handleApproveTransactionalToken(transactionalToken.address)
      .then(updateIsApprovedSettlerToken)
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
    const payload = {
      title: issueTitle,
      description: addFilesInDescription(issueDescription),
      amount: issueAmount.floatValue,
      creatorAddress: BeproService.address,
      creatorGithub: user?.login,
      repository_id,
      branch
    };

    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, amount: payload.amount },
                                       activeNetwork);

    setRedirecting(true);
    apiCreateIssue(payload, activeNetwork?.name)
      .then((cid) => {
        if (!cid) throw new Error(t("errors.creating-issue"));

        dispatch(openIssueTx);

        return BeproService.network
          .openIssue([repository_id, cid].join("/"), payload.amount)
          .then((txInfo) => {
            txWindow.updateItem(openIssueTx.payload.id,
                                parseTransaction(txInfo, openIssueTx.payload));
            // BeproService.parseTransaction(txInfo, openIssueTx.payload)
            //             .then(block => dispatch(updateTransaction(block)))
            return {
              githubId: cid,
              issueId: [repository_id, cid].join("/")
            };
          });
      })
      .then(({ githubId, issueId }) =>
        patchIssueWithScId(repository_id,
                           githubId,
                           issueId,
                           activeNetwork?.name).then(async (result) => {
                             if (!result)
                               return dispatch(toastError(t("create-bounty:errors.creating-bounty")));

                             await router.push(getURLWithNetwork("/bounty", {
              id: githubId,
              repoId: repository_id
                             }));
                           }))
      .catch((e) => {
        console.error("Failed to createIssue", e);
        cleanFields();
        if (e?.message?.search("User denied") > -1)
          dispatch(updateTransaction({ ...(openIssueTx.payload as any), remove: true }));
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
    !(issueAmount.floatValue > Number(wallet?.balance?.bepro));

  const verifyTransactionState = (type: TransactionTypes): boolean =>
    !!myTransactions.find((transactions) =>
        transactions.type === type &&
        transactions.status === TransactionStatus.pending);

  function isCreateButtonDisabled() {
    return [
      wallet?.isApprovedSettlerToken,
      issueContentIsValid(),
      verifyAmountBiggerThanBalance(),
      issueAmount.floatValue > 0,
      !!issueAmount.formattedValue,
      !verifyTransactionState(TransactionTypes.openIssue),
      !!repository_id,
      !!branch,
      !redirecting
    ].some((value) => value === false);
  }

  const isApproveButtonDisabled = (): boolean =>
    [
      !wallet?.isApprovedSettlerToken,
      !verifyTransactionState(TransactionTypes.approveTransactionalERC20Token)
    ].some((value) => value === false);

  const handleIssueAmountBlurChange = () => {
    if (issueAmount.floatValue > Number(wallet?.balance?.bepro)) {
      setIssueAmount({ formattedValue: wallet?.balance?.bepro?.toString() });
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
    if (token.address === BEPRO_TOKEN.address) {
      setTokenBalance(wallet?.balance?.bepro);
      setIsTransactionalTokenApproved(wallet?.isApprovedSettlerToken);
    } else {
      setTokenBalance(await BeproService.getTokenBalance(token.address, wallet.address));
      setIsTransactionalTokenApproved(await BeproService.isTokenApproved(token.address));
    }
  }

  useEffect(() => {
    if (!wallet?.balance) return;
    if (!transactionalToken) return setTransactionalToken(BEPRO_TOKEN);

    updateWalletByToken(transactionalToken);
  }, [transactionalToken, wallet]);

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
                      setRepositoryId(opt.value);
                      setBranch(null);
                    }}
                  />
                </div>
                <div className="col">
                  <BranchsDropdown
                    repoId={repository_id}
                    onSelected={(opt) => setBranch(opt.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <InputNumber
                    thousandSeparator
                    max={tokenBalance}
                    className={clsx({
                      "text-muted": isTransactionalTokenApproved
                    })}
                    label={t("create-bounty:fields.amount.label", {token: transactionalToken?.symbol})}
                    symbol={transactionalToken?.symbol}
                    value={issueAmount.formattedValue}
                    placeholder="0"
                    disabled={!isTransactionalTokenApproved}
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
                    {!isTransactionalTokenApproved ? (
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
