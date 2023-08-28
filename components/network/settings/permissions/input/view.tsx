import { useTranslation } from "next-i18next";

import Button from "components/button";
import { FormGroup } from "components/form-group";

interface PermissionInputProps {
  placeholder?: string;
  value: string;
  onChange: (newValue: string) => void;
  onClickAdd: () => void;
  disabledButton?: boolean;
}

export default function PermissionInput({
  placeholder,
  value,
  onChange,
  onClickAdd,
  disabledButton
}: PermissionInputProps) {
  const { t } = useTranslation(["common"]);

  return (
    <div className="d-flex align-items-center flex-wrap mb-4">
      <FormGroup
        className="me-3"
        placeholder={placeholder}
        variant="input"
        colProps={{ xs: "12", md: "6", xl: "5" }}
        value={value}
        onChange={onChange}
        label=""
      />
      <div className="mt-2">
        <Button onClick={onClickAdd} disabled={disabledButton}>{t("misc.add")}</Button>
      </div>
    </div>
  );
}
