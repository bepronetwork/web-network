import {ReactNode} from "react";

import clsx from "clsx";
import {useTranslation} from "next-i18next";

import Button from "components/button";
import {FormGroup} from "components/form-group";

interface PermissionInputProps {
  placeholder?: string;
  value: string;
  onChange: (newValue: string) => void;
  onClickAdd: () => void;
  disabledButton?: boolean;
  onBlur?: () => void;
  error?: string | ReactNode;
  hint?: string | ReactNode;
  isLoading?: boolean;
}

export default function PermissionInput({
  placeholder,
  value,
  onChange,
  onBlur,
  onClickAdd,
  disabledButton,
  error,
  isLoading
}: PermissionInputProps) {
  const { t } = useTranslation(["common"]);

  return (
    <div className="d-flex align-items-center flex-wrap mb-4">
      <FormGroup
        className="me-md-3"
        placeholder={placeholder}
        variant="input"
        colProps={{ xs: "12", md: "6", xl: "5" }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label=""
        error={error}
      />
      <div className={clsx({"mt-1": !error, "mtn-4": error, "d-grid d-md-block col-12 col-md-1": true})}>
        <Button onClick={onClickAdd} disabled={disabledButton} isLoading={isLoading}>{t("misc.add")}</Button>
      </div>
    </div>
  );
}
