import { useEffect, useRef } from "react";

import jazzicon from "@metamask/jazzicon";

import { SizeOptions } from "interfaces/utils";

interface IdenticonProps {
  address: string;
  size?: SizeOptions;
  withBorder?: boolean;
}

export default function Identicon({
  address,
  withBorder,
  size = "md"
} : IdenticonProps) {
  const ref = useRef<HTMLDivElement>();

  const SIZES = {
    md: 40,
    lg: 108
  };

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = "";
      
      const icon = jazzicon(SIZES[size], parseInt(address.slice(2, 10), 16));
      
      if (size === "lg") icon.style.height = `${SIZES[size]-6}px`;
      
      ref.current.appendChild(icon);
    }
  }, [address]);

  return(
    <div ref={ref} className={`d-flex identicon identicon${withBorder && "-border"} ${size}`}>

    </div>
  );
}