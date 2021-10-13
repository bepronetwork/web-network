import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@contexts/application";
import {useSession} from 'next-auth/react';
import {Image} from 'react-bootstrap';
import Button from "./button";

export default function GithubHandle() {
  const {state: { githubHandle }} = useContext(ApplicationContext);
  const {data: session} = useSession();

  if (githubHandle)
    return (
      <Button className="mr-1" transparent>
        {githubHandle}{" "}
        {session?.user?.image && <Image src={session?.user?.image} className="ms-2 circle-3" />}
      </Button>
    );

  return <></>;
}
