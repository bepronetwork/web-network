import { useEffect, useState } from "react";
import { FormCheck } from "react-bootstrap";
import { NumberFormatValues } from "react-number-format";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import Button from "components/button";
import CreateBountyTokenAmount from "components/create-bounty-token-amount";
import CreateBountyCard from "components/create-bounty/create-bounty-card";
import CreateBountyDetails from "components/create-bounty/create-bounty-details";
import CreateBountyReview from "components/create-bounty/create-bounty-review";
import CreateBountyRewardInfo from "components/create-bounty/create-bounty-reward-info";
import CreateBountySteps from "components/create-bounty/create-bounty-steps";
import SelectNetwork from "components/create-bounty/select-network";
import SelectNetworkDropdown from "components/create-bounty/select-network-dropdown";
import CustomContainer from "components/custom-container";
import { IFilesProps } from "components/drag-and-drop";

import { useAppState } from "contexts/app-state";

import { Network } from "interfaces/network";
import { Token } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";
import useERC20 from "x-hooks/use-erc20";


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
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [repository, setRepository] = useState<{ id: string; path: string }>();
  const [isLoadingCreateBounty, setIsLoadingCreateBounty] =
    useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [issueAmount, setIssueAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [rewardAmount, setRewardAmount] = useState<NumberFormatValues>(ZeroNumberFormatValues);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<Network>();
  const [networks, setNetworks] = useState<Network[]>([]);

  const rewardERC20 = useERC20();

  const transactionalERC20 = useERC20();

  const { searchNetworks } = useApi();

  const {
    dispatch,
    state: {
      transactions,
      Settings,
      Service,
      currentUser,
      show: { createBounty: showCreateBounty },
    },
  } = useAppState();

  const steps = [
    "Select network",
    "Bounty details",
    "Reward Information",
    "Review",
  ];

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

  useEffect(() => {
    searchNetworks({
      isRegistered: true,
      sortBy: "name",
      order: "asc",
      isNeedCountsAndTokensLocked: true
    })
      .then(async ({ count, rows }) => {
        if (count > 0) {
          setNetworks(rows);
        }
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      })
  },[])

  function section() {
    if (currentSection === 0) return <SelectNetwork >
      <SelectNetworkDropdown 
        networks={networks}
        onSelect={setCurrentNetwork}
      />
    </SelectNetwork>;

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
          updateUploading={setIsUploading}
          review={false}
        />
      );

    if (currentSection === 2)
      return (
        <>
          <CreateBountyRewardInfo
            isFunding={isFundingType}
            updateIsFunding={setIsFundingType}
          >
            {renderBountyToken(false, "bounty")}
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
            {rewardChecked &&
              isFundingType &&
              renderBountyToken(false, "reward")}
          </CreateBountyRewardInfo>
        </>
      );

    if (currentSection === 3) return (
        <CreateBountyReview 
          payload={{          title: 'title',
                              description: 'desc',
                              tags: ['js','ts'],
                              repository:'dappkit',
                              branch: 'main',
                              reward: 'string',
                              funders_reward: 'string'
          }}
        />
    )
              

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
        tokens: customTokens.filter((token) => !!token?.network_tokens?.isTransactional),
        balance: transactionalERC20.balance,
        isFunding: false,
        label: t("bounty:fields.select-token.bounty", {
          set: review ? "" : t("bounty:fields.set"),
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
        isFunding: true,
        label: t("bounty:fields.select-token.reward", {
          set: review ? "" : t("bounty:fields.set"),
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
          defaultToken={review && fieldParams[type].default}
          canAddCustomToken={Service?.network?.active?.allowCustomTokens}
          addToken={addToken}
          decimals={fieldParams[type].decimals}
          issueAmount={fieldParams[type].amount}
          setIssueAmount={fieldParams[type].setAmount}
          tokenBalance={fieldParams[type].balance}
          needValueValidation={!isFundingType || type === "reward"}
          isFunding={isFundingType}
          labelSelect={fieldParams[type].label}
          review={review}
        />
      </>
    );
  }

  return (
    <>
      <CustomContainer>
        <CreateBountySteps steps={steps} currentSection={currentSection} />
      </CustomContainer>
      <CustomContainer>
        <CreateBountyCard maxSteps={steps?.length} currentStep={currentSection}>
          {section()}
        </CreateBountyCard>
      </CustomContainer>
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
          <Button
            className="col-6 bounty-button"
            onClick={() => {
              currentSection + 1 < steps.length &&
                setCurrentSection((prevState) => prevState + 1);
            }}
          >
            {currentSection === 3 ? "Create Bounty" : "Next Step"}
          </Button>
        </div>
        {console.log('current network', currentNetwork)}
      </CustomContainer>
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
