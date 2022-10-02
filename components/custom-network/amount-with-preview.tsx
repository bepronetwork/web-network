import ArrowRightLine from "assets/icons/arrow-right-line";

import { formatStringToCurrency } from "helpers/formatNumber";

interface AmountWithPreviewProps {
  amount: string;
  preview?: string;
  previewColor?: string;
  amountColor: string;
  type: "currency" | "percent";
}

export default function AmountWithPreview({
  amount,
  preview,
  previewColor,
  amountColor,
  type
}: AmountWithPreviewProps) {
  function renderAmount() {
    if (type === "percent") return `${formatStringToCurrency(amount)}%`;
    else if (isNaN(+amount)) return `${amount}`;
    
    return formatStringToCurrency(amount);
  }

  function renderPreview() {
    if (type === "percent") return `${formatStringToCurrency(preview)}%`;

    return formatStringToCurrency(preview);
  }

  return(
    <div className="d-flex align-items-center">
      <span className={`text-${amountColor} mr-1`}>
        {renderAmount()}
      </span>

      {preview > amount && (
        <div className={`text-${previewColor}`}>
          <ArrowRightLine />

          <span className="ml-1">
            {renderPreview()}
          </span>
        </div>
      )}
    </div>
  );
}