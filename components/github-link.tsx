import React, { MouseEvent, ReactNode } from "react";

import ExternalLinkIcon from "assets/icons/external-link-icon";

interface GithubLinkParams {
  repoId?: string;
  forcePath?: string;
  hrefPath: string;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  color?: string;
  className?: string;
}

export default function GithubLink({
  hrefPath,
  children,
  forcePath,
  onClick,
  className,
  color = "dark-gray"
}: GithubLinkParams) {
  return (
    <a
      href={`https://github.com/${forcePath}/${hrefPath}`}
      target="_blank"
      className={className ? className : `btn btn-${color} text-uppercase d-flex align-items-center github-link`}
      rel="noreferrer"
      onClick={onClick}
    >
      <span className="text-nowrap">{children}</span>
      <ExternalLinkIcon
        className="ml-1"
        height={10}
        width={10}
        color="text-white-50"
      />
    </a>
  );
}
