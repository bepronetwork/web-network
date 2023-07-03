import If from "components/If";

interface NetworkBadgeProps {
  logoUrl?: string;
  name: string;
}

export default function NetworkBadge({
  logoUrl,
  name,
}: NetworkBadgeProps) {
  return(
    <div className="d-flex gap-2 p-2 bg-gray-850 border-radius-8 border border-gray-800">
      <If condition={!!logoUrl}>
        <img
          src={logoUrl}
          width={14}
          height={14}
        />
      </If>

      <span className="caption-small text-uppercase network-name">
        {name}
      </span>
    </div>
  );
}