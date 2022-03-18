import Avatar from "components/avatar";
import Button from "components/button";

import { useAuthentication } from "contexts/authentication";

export default function GithubHandle() {
  const { user } = useAuthentication();

  if (user?.login)
    return (
      <Button className="mr-1" transparent>
        <span>{user?.name} </span>
        <Avatar src={user?.image} userLogin={user?.login} className="ms-2" />
      </Button>
    );

  return <></>;
}
