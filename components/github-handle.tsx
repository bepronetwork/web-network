import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@contexts/application";
import Avatar from "components/avatar";
import GithubMicroService, { User } from "@services/github-microservice";
import {changeGithubHandle} from '@reducers/change-github-handle';

export default function GithubHandle() {
  const {state: { githubHandle, githubLogin },} = useContext(ApplicationContext);

  if (githubHandle)
    return (
      <span className="btn btn-md btn-trans mr-1">
        {githubHandle}{" "}
        {githubLogin && <Avatar userLogin={githubLogin} className="ms-2" />}
      </span>
    );

  return <></>;
}
