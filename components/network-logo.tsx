import BeProBlue from "assets/icons/bepro-blue";

import { SizeOptions } from "interfaces/utils";

interface NetworkLogoProps {
  src: string;
  alt?: string;
  isBepro?: boolean;
  size?: SizeOptions;
  noBg?: boolean;
}

export default function NetworkLogo({
  src,
  isBepro = false,
  size = "md",
  noBg,
  ...props
}: NetworkLogoProps) {
  const sizes = {
    sm: 15,
    md: 24
  };

  return (
    <div className={
      `${noBg ? "p-0" : "bg-dark p-2"} d-flex align-items-center justify-content-center rounded-circle`
    }>
      {isBepro ? (
        <BeProBlue width={sizes[size]} height={sizes[size]} />
      ) : (
        <img src={src} {...props} width={sizes[size]} height={sizes[size]} />
      )}
    </div>
  );
}
