import BeProBlue from "assets/icons/bepro-blue";

interface NetworkLogoProps {
  src: string;
  alt?: string;
  isBepro?: boolean;
  size?: 'lg' | 'md'
}

export default function NetworkLogo({
  src,
  isBepro = false,
  size = 'lg',
  ...props
}: NetworkLogoProps) {
  const scale = size === 'lg' ? 24 : 20
  return (
    <div className={`network-logo-${size} bg-dark d-flex align-items-center justify-content-center rounded-circle`}>
      {isBepro ? (
        <BeProBlue width={scale} height={scale} />
      ) : (
        <img src={src} {...props} width={scale} height={scale} />
      )}
    </div>
  );
}
