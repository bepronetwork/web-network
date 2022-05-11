import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@contexts/application";
import {useSession} from 'next-auth/react';
import {Image} from 'react-bootstrap';
import Button from "./button";
import Avatar from "./avatar";

export default function GithubHandle() {
  const {state: { githubHandle, githubLogin }} = useContext(ApplicationContext);
  const {data: session} = useSession();
  
  if (githubHandle)
    return (
      <Button className="mr-1" transparent>
        <span>{githubHandle}{" "}</span>
        <Avatar src={session?.user?.image} userLogin={githubLogin} className="ms-2" />
      </Button>
    );

  return <></>;
}
