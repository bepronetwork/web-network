import { useTranslation } from "next-i18next";

interface CounInfoProps {
  type: "working" | "pull-requests" | "proposals";
  count: number;
}

export default function CountInfo({
  type,
  count
} : CounInfoProps) {
  const { t } = useTranslation("bounty");

  return(
    <div>
      <span className="caption-small mr-1 text-white">
        {count || 0}
      </span>
      <span className="caption-small text-white-40 text-uppercase">
        {t(`info.${type}`, {count: count })}
      </span>
    </div>
  );
}