import {ReactElement, useEffect, useState} from "react";

interface IfProps {
  condition: boolean | (() => boolean);
  otherwise?: ReactElement;
  children: ReactElement;
}

export default function If({condition, children, otherwise}: IfProps) {
  const [value, setValue] = useState<boolean>(typeof condition === "function" ? condition() : condition)

  function updateValue() {
    setValue(typeof condition === "function" ? condition() : condition)
  }

  useEffect(updateValue,[condition])

  return <>{value ? children : otherwise || null}</>;
}