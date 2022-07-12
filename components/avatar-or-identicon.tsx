import Avatar from "components/avatar"
import Identicon from "components/identicon"

import { SizeOptions } from "interfaces/utils";

interface AvatarOrIdenticonProps {
  user?: string;
  address?: string;
  size?: SizeOptions;
  withBorder?: boolean;
}

export default function AvatarOrIdenticon({
  user,
  address,
  size = "md",
  withBorder
} : AvatarOrIdenticonProps ) {

  if (user) 
    return <Avatar userLogin={user} className="border-primary" size={size} border={withBorder} />;
  
  if (address)
    return <Identicon address={address} size={size} withBorder={withBorder} />;

  return <></>;
}