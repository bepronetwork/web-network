import { ReactNode } from "react";
import { Col, Form } from "react-bootstrap";

import { WarningSpan } from "components/warning-span";

interface FormGroupProps {
  label: string;
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  error?: string | ReactNode;
  onBlur?: () => void;
  onChange?: (newValue: string) => void;
}

export function FormGroup({ label, onChange, error, ...rest } : FormGroupProps) {
  function handleChange(e) {
    onChange?.(e.target.value);
  }

  return(
    <Col>
      <Form.Group className="form-group">
        <Form.Label className="caption-small">{label}</Form.Label>
        <Form.Control
          type="text"
          onChange={handleChange}
          {...rest}
        />

        { error &&
          <WarningSpan
            type="danger"
            text={error}
          />
        }
      </Form.Group>
    </Col>
  ); 
}