import { useReducer, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import Button from "components/button";
import CreateBountyCard from "components/create-bounty/create-bounty-card";
import CreateBountyDetails from "components/create-bounty/create-bounty-details";
import CreateBountySteps from "components/create-bounty/create-bounty-steps";
import SelectNetwork from "components/create-bounty/select-network";
import CustomContainer from "components/custom-container";
import { IFilesProps } from "components/drag-and-drop";


interface DetailsProps{
  title: string;
  description: string;
  selectedTags: string[];
  files: IFilesProps[];
  isUploading: boolean;
}

export default function CreateBountyPage() {
  const { t } = useTranslation(["common", "bounty"]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [details, updateDetails] = useReducer((prev: DetailsProps, next: Partial<DetailsProps>) => {
    return {...prev, ...next}
  }, {
    title: "", 
    description: "", 
    selectedTags: [],
    files: [],
    isUploading: false
  })

  const steps = [
    "Select network",
    "Bounty details",
    "Reward Information",
    "Review",
  ];

  function onUpdateFiles(files: IFilesProps[]) {
    return updateDetails({ files });
  }

  function CurrentSection() {
    if (currentSection === 0) return <SelectNetwork />;

    if (currentSection === 1)
      return (
        <CreateBountyDetails
          bountyTitle={details?.title}
          setBountyTitle={(v: string) => updateDetails({ title: v })}
          bountyDescription={details?.description}
          setBountyDescription={(v: string) => updateDetails({ description: v})}
          onUpdateFiles={onUpdateFiles}
          onUploading={(v: boolean) => updateDetails({ isUploading: v })}
          review={false}
          files={details?.files}
          selectedTags={details?.selectedTags}
          setSelectedTags={(v: string[]) => updateDetails({ selectedTags: v })}
        />
      );
  }

  return (
    <>
      <CustomContainer>
        <CreateBountySteps steps={steps} currentSection={currentSection} />
      </CustomContainer>
      <CustomContainer>
        <CreateBountyCard maxSteps={steps?.length} currentStep={currentSection}>
          <CurrentSection />
        </CreateBountyCard>
      </CustomContainer>
      <CustomContainer>
        <div className="d-flex justify-content-between mt-4">
          <Button onClick={() => {
            currentSection !== 0 &&
                        setCurrentSection((prevState) => prevState - 1);
          }}>cancel</Button>
          <Button onClick={() => {
            currentSection + 1 < steps.length &&
                setCurrentSection((prevState) => prevState + 1);
          }}>next step</Button>
        </div>
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
