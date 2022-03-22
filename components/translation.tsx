import { useTranslation } from "next-i18next";

export default function Translation({
  ns = "common",
  label = "",
  params = {}
}) {
  const { t } = useTranslation(ns);
  return <>{t(label, { ...params })}</>;
}
