import { useEffect, useRef } from "react";

import jazzicon from "@metamask/jazzicon";

export default function Identicon({
  address,
  withBorder = false
}) {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(jazzicon(40, parseInt(address.slice(2, 10), 16)));
    }
  }, [address]);

  return(
    <div ref={ref} className={`d-flex identicon${withBorder && "-border"}`}>

    </div>
  );
}