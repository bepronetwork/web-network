import BeProBlue from "assets/icons/bepro-blue";

interface NetworkLogoProps {
  src: string;
  alt?: string;
  isBepro?: boolean;
}

export default function NetworkLogo({
  src,
  isBepro = false,
  ...props
}: NetworkLogoProps) {
  return (
    <div className="network-logo bg-dark d-flex align-items-center justify-content-center rounded-circle">
      {isBepro ? (
        <BeProBlue width={24} height={24} />
      ) : (
        <img src={src} {...props} width={24} height={24} />
      )}
    </div>
  );
}
