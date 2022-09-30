import { Col, ProgressBar, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { Amount, ColAuto, RowCenterBetween, RowWithTwoColumns } from "components/bounty/funding-section/minimals";

interface FundingProgressProps {
  fundedAmount: string;
  fundingAmount: string;
  fundedPercent: string;
  fundingTokenSymbol: string;
  amountToFund?: string;
}

export default function FundingProgress({
  fundedAmount,
  fundingAmount,
  fundedPercent,
  fundingTokenSymbol,
  amountToFund = "0"
} : FundingProgressProps) {
  const fundingPercent = BigNumber(amountToFund).multipliedBy(100).dividedBy(fundingAmount);
  const maxPercent = BigNumber(100).minus(fundedPercent);
  const totalPercent = fundingPercent.plus(fundedPercent);
  const isFundingModal = BigNumber(amountToFund).gt(0);
  const contextClass = totalPercent.lt(100) ? "primary" : (totalPercent.isEqualTo(100) ? "success" : "danger");
  const secondaryProgressVariant = 
    totalPercent.lt(100)? "blue-dark" : (totalPercent.isEqualTo(100) ? "success-50" : "danger-50");
  const fundPreview = BigNumber(fundedAmount).plus(amountToFund).toFixed();

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
        col1={<AmountWithPreview amount={fundedAmount} preview={fundPreview} type="currency" />}
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
              now={+fundedPercent}
              isChild
            />

            { isFundingModal && 
              <ProgressBar
                variant={secondaryProgressVariant}
                min={0}
                now={fundingPercent.gt(maxPercent) ? 100 : fundingPercent.toNumber()}
                isChild
              />
            }
          </ProgressBar>
        </Col>

        <ColAuto>
          <AmountWithPreview amount={fundedPercent} preview={totalPercent.toFixed(2, 1)} type="percent" />
        </ColAuto>
      </RowCenterBetween>
    </div>
  );
}