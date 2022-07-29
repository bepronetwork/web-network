import { Col, ProgressBar, Row } from "react-bootstrap";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { Amount, ColAuto, RowCenterBetween, RowWithTwoColumns } from "components/bounty/funding-section/minimals";

interface FundingProgressProps {
  fundedAmount: number;
  fundingAmount: number;
  fundedPercent: number;
  fundingTokenSymbol: string;
  amountToFund?: number;
}

export default function FundingProgress({
  fundedAmount,
  fundingAmount,
  fundedPercent,
  fundingTokenSymbol,
  amountToFund = 0
} : FundingProgressProps) {
  const fundingPercent = amountToFund / fundingAmount * 100;
  const maxPercent = 100 - fundedPercent;
  const totalPercent = fundingPercent + fundedPercent;
  const isFundingModal = amountToFund > 0;
  const contextClass = totalPercent < 100 ? "primary" : (totalPercent === 100 ? "success" : "danger");
  const secondaryProgressVariant = 
    totalPercent < 100 ? "blue-dark" : (totalPercent === 100 ? "success-50" : "danger-50");

  const AmountWithPreview = ({ amount, preview = undefined, type }) => 
    <Row className="align-items-center">
      <Col>
        <Amount amount={amount} className={isFundingModal && "caption-medium" || undefined} type={type} />
      </Col>
      { isFundingModal &&
        <>
          <Col className="svg-white-40 px-0">
            <ArrowRightLine width={10} height={10} />
          </Col>
          <Col>
            <Amount className={`text-${contextClass} caption-medium`} amount={preview} type={type} />
          </Col>
        </>
      }
    </Row>;

  return(
    <div>
      <RowWithTwoColumns
        col1={<AmountWithPreview amount={fundedAmount} preview={amountToFund} type="currency" />}
        col2={<Amount 
                amount={fundingAmount} 
                symbol={fundingTokenSymbol} 
                className={isFundingModal && "caption-medium" || undefined} 
              />}
      />

      <RowCenterBetween className="mt-1">
        <Col>
          <ProgressBar>
            <ProgressBar
              now={fundedPercent}
              isChild
            />

            { isFundingModal && 
              <ProgressBar
                variant={secondaryProgressVariant}
                min={0}
                now={fundingPercent > maxPercent ? 100 : fundingPercent}
                isChild
              />
            }
          </ProgressBar>
        </Col>

        <ColAuto>
          <AmountWithPreview amount={fundedPercent} preview={totalPercent} type="percent" />
        </ColAuto>
      </RowCenterBetween>
    </div>
  );
}