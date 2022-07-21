import { Col, ProgressBar, Row } from "react-bootstrap";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { Amount, ColAuto, RowCenterBetween, RowWithTwoColumns } from "components/bounty/funding-section/minimals";

import { formatNumberToString } from "helpers/formatNumber";

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

  const FundedAmountWithPreview = () => 
    <Row className="align-items-center">
      <Col>
        <Amount amount={fundedAmount} />
      </Col>
      { isFundingModal &&
        <>
          <Col className="svg-white-40 px-0">
            <ArrowRightLine width={10} height={10} />
          </Col>
          <Col>
            <Amount className="text-primary" amount={amountToFund} />
          </Col>
        </>
      }
    </Row>;

  return(
    <div>
      <RowWithTwoColumns
        col1={<FundedAmountWithPreview />}
        col2={<Amount amount={fundingAmount} symbol={fundingTokenSymbol} />}
      />

      <RowCenterBetween>
        <Col>
          <ProgressBar>
            <ProgressBar
              now={fundingPercent > maxPercent ? 100 : fundedPercent}
              isChild
            />

            { isFundingModal && 
              <ProgressBar
                variant="blue-dark"
                min={0}
                now={fundingPercent > maxPercent ? 0 : fundingPercent}
                isChild
              />
            }
          </ProgressBar>
        </Col>

        <ColAuto>
          <span className="ml-1 caption-medium text-white font-weight-normal">
            {formatNumberToString(totalPercent, 0)}%
          </span>
        </ColAuto>
      </RowCenterBetween>
    </div>
  );
}