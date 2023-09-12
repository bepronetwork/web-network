import {useTranslation} from "next-i18next";

import Button from "../../../button";
import {FormGroup} from "../../../form-group";
import {ReactNode} from "react";

interface PermissionInputProps {
  placeholder?: string;
  value: string;
  onChange: (newValue: string) => void;
  onClickAdd: () => void;
  disabledButton?: boolean;
  onBlur?: () => void;
  error?: string | ReactNode;
  hint?: string | ReactNode;
}

export default function PermissionInput({
  placeholder,
  value,
  onChange,
  onBlur = () => {},
  onClickAdd,
  disabledButton,
  error,
  hint,
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
        onBlur={onBlur}
        label=""
        error={error}
        hint={hint}
      />
      <div className="mt-2">
        <Button onClick={onClickAdd} disabled={disabledButton}>{t("misc.add")}</Button>
      </div>
    </div>
  );
}
