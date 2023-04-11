import CopyIcon from "assets/icons/copy-icon";

import Button from "components/button";

import { CopyValue } from "helpers/copy-value";

interface CopyButtonProps {
  value: string;
}

export default function CopyButton({
  value
}: CopyButtonProps) {
  function handleCopy() {
    CopyValue(value);
  }

  return(
    <Button
      onClick={handleCopy}
      color="gray-800"
      textClass="text-gray-50"
      className="border-radius-4 p-1 border-gray-700 not-svg"
    >
      <CopyIcon />
    </Button>
  );
}