import PullRequestLabels, { IPRLabel } from "components/pull-request/labels/controller";

export default function ItemRowLabelsView({
    status,
    className,
    classLabels,
  }: {
    status: IPRLabel[];
    className?: string;
    classLabels?: string;
  }) {
  return (
      <div className={`${className} col-md-4 d-flex gap-2`}>
        {status?.length
          ? status.map((st) => (
              <PullRequestLabels {...st} className={classLabels} />
            ))
          : null}
      </div>
  );
}
