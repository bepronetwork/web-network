import React, {ReactNode, useState} from 'react';
import useGithubRepo from '@x-hooks/use-github-repo';
import ExternalLinkIcon from '@assets/icons/external-link-icon';

interface GithubLinkParams {
  repoId?: string;
  forcePath?: string;
  hrefPath: string;
  children: ReactNode;
  color?: string;
}

export default function GithubLink({repoId, hrefPath, children, forcePath, color = `dark-gray`}: GithubLinkParams) {
  const [githubPath,] = useGithubRepo(repoId, forcePath);

  return <a href={`https://github.com/${githubPath}/${hrefPath}`} target="_blank"
            className={`btn btn-${color} text-uppercase d-flex align-items-center`}>
    <span>{children}</span>
    <ExternalLinkIcon className="ml-1" height={10} width={10} color="text-white-50"/>
  </a>
}
