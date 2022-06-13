import ArrowRightLine from "assets/icons/arrow-right-line";

import { formatNumberToCurrency } from "helpers/formatNumber";

interface AmountWithPreviewProps {
  amount: number | string;
  preview?: number | string;
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
    if (type === "percent") return `${formatNumberToCurrency(amount, { maximumFractionDigits: 2 })}%`;
    else if (isNaN(+amount)) return `${amount}`;
    
    return formatNumberToCurrency(amount, { maximumFractionDigits: 18 });
  }

  function renderPreview() {
    if (type === "percent") return `${formatNumberToCurrency(preview, { maximumFractionDigits: 2 })}%`;

    return formatNumberToCurrency(preview, { maximumFractionDigits: 18 });
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