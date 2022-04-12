import React from "react";

import removeMarkdown from "markdown-to-text";
import { DefaultSeo, NextSeo } from "next-seo";
import getConfig from "next/config";

import { IssueData } from "interfaces/issue-data";

import SEO_CONFIG from "../next-seo-config";
const {publicRuntimeConfig} = getConfig()

interface ISeoProps {
  issueMeta?: IssueData;
}

const Seo: React.FC<ISeoProps> = ({ issueMeta }) => {
  if (issueMeta) {
    const [repoId, ghId] = issueMeta?.issueId?.split("/");
    const description = removeMarkdown(issueMeta?.body?.substring(0, 160).trimEnd());
    return (
      <NextSeo
        title={issueMeta?.title}
        openGraph={{
          url: `${publicRuntimeConfig.homeUrl}/bounty?id=${ghId}&repoId=${repoId}`,
          title: issueMeta?.title,
          description: `${description}...` || "",
          images: [
            {
              url: `${publicRuntimeConfig.homeUrl}/api/seo/${issueMeta?.issueId}`,
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
