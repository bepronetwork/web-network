import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@contexts/application";
import Avatar from "components/avatar";
import GithubMicroService, { User } from "@services/github-microservice";
import {changeGithubHandle} from '@reducers/change-github-handle';
import {useSession} from 'next-auth/react';
import {Image} from 'react-bootstrap';

export default function GithubHandle() {
  const {state: { githubHandle, githubLogin },} = useContext(ApplicationContext);
  const {data: session} = useSession();

  if (githubHandle)
    return (
      <span className="btn btn-md btn-trans mr-1">
        {githubHandle}{" "}
        {session?.user?.image && <Image src={session?.user?.image} className="ms-2 circle-3" />}
      </span>
    );

  return <></>;
}
