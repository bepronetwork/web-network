import {useSession} from "next-auth/react";

import Avatar from "components/avatar";
import Button from "components/button";

export default function GithubHandle() {
  const session = useSession();

  if (session?.data?.login)
    return (
      <Button className="mr-1" transparent>
        <span>{session?.data.name} </span>
        <Avatar src={session?.data.image as string} userLogin={session?.data.login as string} className="ms-2" />
      </Button>
    );

  return <></>;
}
