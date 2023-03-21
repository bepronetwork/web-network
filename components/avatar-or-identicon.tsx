import Avatar from "components/avatar"
import Identicon from "components/identicon"

import { SizeOptions } from "interfaces/utils";

interface AvatarOrIdenticonProps {
  user?: string;
  address?: string;
  size?: SizeOptions;
  withBorder?: boolean;
  active?: boolean;
}

export default function AvatarOrIdenticon({
  user,
  address,
  size = "md",
  withBorder,
  active = false
} : AvatarOrIdenticonProps ) {

  if (!user && !address) return <></>;

  return(
    <div className={`${withBorder ? "border-avatar p-1" : ""} ${withBorder && active ? "active" : ""}`}>
      { user ? 
        <Avatar userLogin={user} className="border-primary" size={size} /> : 
        <Identicon address={address} size={size} /> 
      }
    </div>
  );
}