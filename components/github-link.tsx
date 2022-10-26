import React, { ReactNode } from "react";

import ExternalLinkIcon from "assets/icons/external-link-icon";

interface GithubLinkParams {
  repoId?: string;
  forcePath?: string;
  hrefPath: string;
  children: ReactNode;
  onClick?: () => void;
  color?: string;
}

export default function GithubLink({
  hrefPath,
  children,
  forcePath,
  onClick,
  color = "dark-gray"
}: GithubLinkParams) {


  return (
    <div onClick={onClick}>
      <a
        href={!onClick ?`https://github.com/${forcePath}/${hrefPath}`: "#"}
        target="_blank"
        className={`btn btn-${color} text-uppercase d-flex align-items-center github-link`}
        rel="noreferrer"
      >
        <span className="text-nowrap">{children}</span>
        <ExternalLinkIcon
          className="ml-1"
          height={10}
          width={10}
          color="text-white-50"
        />
      </a>
    </div>
  );
}
