import { Fragment, useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import DoneIcon from "assets/icons/done-icon";

import Button from "components/button";
import Modal from "components/modal";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { BEPRO_TOKEN, Token, TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

import BranchsDropdown from "./branchs-dropdown";
import CreateBountyDetails from "./create-bounty-details";
import CreateBountyTokenAmount from "./create-bounty-token-amount";
import { IFilesProps } from "./drag-and-drop";
import GithubInfo from "./github-info";
import ReposDropdown from "./repos-dropdown";

const { publicRuntimeConfig } = getConfig();
interface Amount {
  value?: string;
  formattedValue: string;
  floatValue?: number;
}

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "create-bounty"]);

  const { activeNetwork } = useNetwork();
  const [show, setShow] = useState<boolean>(false);
  const [bountyTitle, setBountyTitle] = useState<string>();
  const [bountyDescription, setBountyDescription] = useState<string>();
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [branch, setBranch] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [activeBounty, setActiveBounty] = useState<boolean>(true);
  const [issueAmount, setIssueAmount] = useState<Amount>({
    value: "",
    formattedValue: "",
    floatValue: 0,
  });
  const [isTransactionalTokenApproved, setIsTransactionalTokenApproved] =
    useState(false);
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const [transactionalAllowance, setTransactionalAllowance] =
    useState<number>();
  const [coinInfo, setCoinInfo] = useState<TokenInfo>();
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

  function handleIssueAmountOnValueChange(values: Amount) {
    if (values.floatValue < 0 || values.value === "-") {
      setIssueAmount({ formattedValue: "" });
    } else {
      setIssueAmount(values);
    }
  }

  function handleRewardChecked(e) {
    setRewardChecked(e.target.checked);
  }

  async function getCoinInfo(address) {
    await getCoinInfoByContract(address)
      .then((tokenInfo) => {
        setCoinInfo(tokenInfo);
      })
      .catch((err) => {
        console.error("CoinInfo", err);
        setCoinInfo(null);
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
        handleAmountOnValueChange={handleIssueAmountOnValueChange}
        handleAmountBlurChange={handleIssueAmountBlurChange}
        tokenBalance={tokenBalance}
        isCurrentTokenApproved={isTransactionalTokenApproved}
        coinInfo={coinInfo}
        labelSelect="set Bounty Token"
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
                    style={{}}
                    type="checkbox"
                    label="Reward Funders"
                    onChange={handleRewardChecked}
                  />
                </div>
                {rewardChecked && (
                  <div className="col-md-12">
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
                      handleAmountOnValueChange={handleIssueAmountOnValueChange}
                      handleAmountBlurChange={handleIssueAmountBlurChange}
                      tokenBalance={tokenBalance}
                      isCurrentTokenApproved={isTransactionalTokenApproved}
                      coinInfo={coinInfo}
                      labelSelect="set Reward Token"
                    />
                  </div>
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
                  console.log("test", opt);
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
          <div className="row">
            <div className="col-md-6">
              <label className="caption-small mb-2">
                Repository
              </label>
              <GithubInfo
                parent="list"
                variant="repository"
                label={repository?.path}
              />
            </div>
            <div className="col-md-6">
            <label className="caption-small mb-2">
                Branch
              </label>
              <GithubInfo parent="list" variant="repository" label={branch} />
            </div>
          </div>
        </>
      );
    }
  }

  function addToken(newToken: Token) {
    setCustomTokens([...customTokens, newToken]);
  }

  function renderColumn(stepLabel: string, index: number) {
    function handleStyleColumns(column) {
      if (column === 0) {
        return "50px";
      } else if (column === 1) {
        return "166px";
      } else {
        return `${column * 144}px`;
      }
    }

    function handleColorState(index) {
      if (index === currentSection) {
        return "text-white";
      } else if (index < currentSection) {
        return "text-primary";
      } else {
        return "color-light-gray";
      }
    }

    const style = { left: handleStyleColumns(index) };
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-light-gray`;
    const dotStyle = { width: "18px", height: "18px" };
    const labelStyle = { top: "20px" };

    return (
      <Fragment key={index}>
        <div
          className="position-absolute d-flex align-items-center flex-column"
          style={style}
        >
          <div className={dotClass} style={dotStyle}>
            <div
              className={`rounded-circle bg-${
                index <= currentSection ? "primary" : "black"
              }`}
              style={{ width: "18px", height: "18px" }}
            >
              {index < currentSection ? (
                <DoneIcon />
              ) : (
                <span className={handleColorState(index)}>{index + 1}</span>
              )}
            </div>
          </div>
          <div
            className="position-absolute d-flex align-items-start flex-column mt-1"
            style={labelStyle}
          >
            <label
              className={`text-uppercase caption-small ${handleColorState(index)}`}
            >
              {stepLabel}
            </label>
          </div>
        </div>
      </Fragment>
    );
  }

  function handleNextStepAndCreate() {
    currentSection + 1 < steps.length &&
      setCurrentSection((prevState) => prevState + 1);
  }

  function handleCancelAndBack() {
    if (currentSection === 0) {
      setBountyTitle("");
      setBountyDescription("");
      setShow(false);
    } else {
      setCurrentSection((prevState) => prevState - 1);
    }
  }

  function setProgressBar() {
    const progress = [0, 30, 60, 100];
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])]);
  }

  const updateWalletByToken = (token: Token) => {
    DAOService.getTokenBalance(token.address, wallet.address).then(setTokenBalance);

    DAOService.getAllowance(token.address,
                            wallet.address,
                            DAOService.network.contractAddress).then(setTransactionalAllowance);
  };

  useEffect(() => {
    if (!wallet?.balance || !DAOService) return;
    if (!transactionalToken) return setTransactionalToken(BEPRO_TOKEN);

    updateWalletByToken(transactionalToken);
  }, [transactionalToken, wallet, DAOService]);

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
    transactionalToken?.address && getCoinInfo(transactionalToken.address);
  }, [transactionalToken]);

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

            <Button
              className="d-flex flex-shrink-0 w-40 btn-block"
              onClick={handleNextStepAndCreate}
            >
              <span>
                {currentSection !== 3 ? "Next Step" : t(" :create-bounty")}
              </span>
            </Button>
          </>
        }
      >
        <>
          <div className="container mb-4 pb-4">
            <div className="row justify-content-md-center">
              <div className="p-0 col-md-10">
                <div className="progress bg-black issue-progress-vertical">
                  <div
                    className={`progress-bar bg-primary`}
                    role="progressbar"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  >
                    {steps.map(renderColumn)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {renderCurrentSection()}
        </>
      </Modal>
    </>
  );
}
