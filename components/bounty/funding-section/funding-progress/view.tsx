import { Col, ProgressBar, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { Amount, ColAuto, RowCenterBetween, RowWithTwoColumns } from "components/bounty/funding-section/minimals.view";

interface FundingProgressViewProps {
  fundedAmount: string;
  fundingAmount: string;
  fundedPercent: string;
  fundingTokenSymbol: string;
  isFundingModal: boolean;
  contextClass: string;
  fundPreview: string;
  secondaryProgressVariant: "blue-dark" | "success-50" | "danger-50";
  fundingPercent: BigNumber;
  totalPercent: BigNumber;
  maxPercent: BigNumber;
}

export default function FundingProgressView({
  fundedAmount,
  fundingAmount,
  fundedPercent,
  fundingTokenSymbol,
  isFundingModal,
  contextClass,
  fundPreview,
  secondaryProgressVariant,
  fundingPercent,
  totalPercent,
  maxPercent
} : FundingProgressViewProps) {

  const AmountWithPreview = ({ amount, preview = undefined, type }) => 
    <Row className="align-items-center">
      <Col>
        <Amount 
          amount={amount} 
          className={isFundingModal ? "caption-medium" : type === "percent" ? "base-medium" : "xl-semibold"} 
          type={type}
        />
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
        col1={
          <AmountWithPreview 
            amount={fundedAmount} 
            preview={fundPreview} 
            type="currency"
          />
        }
        col2={
          <Amount 
            amount={fundingAmount} 
            symbol={fundingTokenSymbol} 
            className={isFundingModal && "caption-medium" || "xl-semibold"}
          />
        }
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