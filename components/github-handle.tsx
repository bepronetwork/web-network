import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@contexts/application";
import Avatar from "components/avatar";
import GithubMicroService, { User } from "@services/github-microservice";

export default function GithubHandle() {
  const {
    state: { githubHandle: contextHandle, currentAddress },
    dispatch,
  } = useContext(ApplicationContext);
  const [githubLogin, setGithubLogin] = useState<string>();

  function getGithubLogin() {
    if (contextHandle && currentAddress)
      GithubMicroService.getUserOf(currentAddress).then((handle: User) =>
        setGithubLogin(handle.githubLogin)
      );
  }

  useEffect(getGithubLogin, [contextHandle, currentAddress]);

  if (contextHandle)
    return (
      <span className="btn btn-md btn-trans mr-1">
        {contextHandle}{" "}
        {githubLogin && <Avatar userLogin={githubLogin} className="ms-2" />}
      </span>
    );

  return <></>;
}
