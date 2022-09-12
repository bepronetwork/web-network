import { useTranslation } from "next-i18next";

export default function TreasuryAddressField({
  value,
  onChange,
  validated = undefined,
  disabled = false
}) {
  const { t } = useTranslation("custom-network");

  const handleChange = e => onChange(e.target.value);

  return(
    <>
      <label className="caption-small mb-2">
        {t("custom-network:steps.treasury.fields.address.label")}
      </label>

      <input 
        type="text" 
        className="form-control" 
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />

      {
        validated === false && 
        <small className="small-info text-danger mt-1">
          {t("custom-network:steps.treasury.fields.address.error")}
        </small>
      }
    </>
  );
}
