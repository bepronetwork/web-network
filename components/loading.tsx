import React from 'react';
import { Spinner } from "react-bootstrap";

export default function Loading({ ...params }): JSX.Element {
  return (
    <Spinner animation="border" role="status" {...params}>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
