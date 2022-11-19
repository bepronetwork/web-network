import { SetStateAction } from "react";
import { Col } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import { ExternalLink } from "components/external-link";
import { FormGroup } from "components/form-group";

import { useAppState } from "contexts/app-state";

export interface ContractField {
  value: string;
  validated: boolean;
}

interface ContractInputProps {
  field: ContractField;
  contractName: string;
  validator?: string;
  onChange?: (value: SetStateAction<ContractField>) => void;
  docsLink: string;
  readOnly?: boolean;
  action?: {
    disabled: boolean;
    executing: boolean;
    label: string;
    onClick: () => void;
  };
}

export function ContractInput({
  field,
  onChange,
  contractName,
  docsLink,
  action,
  validator,
  readOnly
} : ContractInputProps) {
  const { t } = useTranslation(["common", "setup"]);
  const { state: { Service } } = useAppState();

  function isInvalid(validated, name) {
    return validated === false ? t("setup:errors.invalid-contract-address", { contract: name }) : undefined;
  }

  function handleChange(value: string) {
    onChange?.(previous => ({ ...previous, value}));
  }

  function validateContractField() {
    if (!validator) return;

    const { value } = field;

    if (!Service?.active || value.trim() === "") 
      return onChange(previous => ({ ...previous, validated: undefined }));

    if (!Service.active.isAddress(value))
      return onChange(previous => ({ ...previous, validated: false }));
    
    Service.active[validator](value)
      .then(loaded => onChange(previous => ({ ...previous, validated: !!loaded })));
  }

  return(
    <>
      <FormGroup
          label={contractName}
          placeholder={t("setup:fields.contract-field.placeholder", { contract: contractName })}
          value={field.value}
          onChange={handleChange}
          readOnly={readOnly}
          onBlur={validateContractField}
          error={isInvalid(field.validated, contractName)}
          hint={
            <ExternalLink
              label={t("setup:fields.contract-field.hint", { contract: contractName })}
              href={docsLink}
            />
          }
        />

        { action && 
          <Col xs="auto">
            <Button
              disabled={action.disabled} 
              withLockIcon={action.disabled || action.executing}
              isLoading={action.executing}
              onClick={action.onClick}
            >
              <span>{action.label}</span>
            </Button>
          </Col>
        }
    </>
  );
}