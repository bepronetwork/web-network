import { useEffect, useRef } from "react";

import jazzicon from "@metamask/jazzicon";

import { SizeOptions } from "interfaces/utils";

interface IdenticonProps {
  address: string;
  size?: SizeOptions;
  className?: string;
}

export default function Identicon({
  address,
  size = "md",
  className
} : IdenticonProps) {
  const ref = useRef<HTMLDivElement>();

  const SIZES = {
    sm: 32,
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
    <div ref={ref} className={`d-flex identicon ${size} ${className}`}>

    </div>
  );
}