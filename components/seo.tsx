import React, {useEffect, useState} from "react";

import removeMarkdown from "markdown-to-text";
import {DefaultSeo, NextSeo} from "next-seo";
import getConfig from "next/config";

import {IssueBigNumberData, IssueData} from "interfaces/issue-data";

import SEO_CONFIG from "../next-seo-config";
import {useAppState} from "../contexts/app-state";

const { publicRuntimeConfig } = getConfig();

interface ISeoProps {
  issueMeta?: IssueData;
}

const Seo: React.FC<ISeoProps> = () => {

  const {state} = useAppState();
  const [issueMeta, setIssueMeta] = useState<IssueBigNumberData>(null);

  useEffect(() => { setIssueMeta(state.currentBounty?.data)}, [state.currentBounty?.data]);

  if (issueMeta) {
    const homeUrl = publicRuntimeConfig?.urls?.home;
    const [repoId, ghId] = issueMeta?.issueId?.split("/");
    const description = removeMarkdown(issueMeta?.body?.substring(0, 160).trimEnd());
    if(homeUrl)
      return (
        <NextSeo
          title={issueMeta?.title?.replace(/\b\w/g, c => c.toUpperCase())}
          openGraph={{
            url: `${homeUrl}/bounty?id=${ghId}&repoId=${repoId}`,
            title: issueMeta?.title,
            description: `${description}...` || "",
            images: [
              {
                url: `${homeUrl}/api/seo/${issueMeta?.issueId}`,
                width: 1200,
                height: 670,
                alt: "Bounty Info",
                type: "image/jpeg"
              }
            ],
            site_name: "Bepro Network"
          }}
          twitter={{
            handle: "@bepronet",
            cardType: "summary_large_image"
          }}
        />
      );
  }

  return <DefaultSeo {...SEO_CONFIG} />;
};

export default Seo;
