import React, {useEffect, useState} from "react";

import removeMarkdown from "markdown-to-text";
import {DefaultSeo, NextSeo} from "next-seo";
import SEO_CONFIG from "next-seo-config";
import getConfig from "next/config";
import { useRouter } from "next/router";

import {IssueData} from "interfaces/issue-data";

const { publicRuntimeConfig } = getConfig();

interface ISeoProps {
  issueMeta?: IssueData;
}

const Seo: React.FC<ISeoProps> = ({ issueMeta }) => {
  const {query} = useRouter();

  if (issueMeta?.issueId && query?.id && query?.repoId) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const homeUrl = publicRuntimeConfig?.urls?.home;
    // eslint-disable-next-line no-unsafe-optional-chaining
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
