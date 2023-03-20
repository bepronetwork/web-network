import { isArray } from "lodash";

interface ReviewProps {
  [name: string]: string | string[];
}

type Value = string | string[];

export default function CreateBountyReview({
  payload,
}: {
  payload: ReviewProps;
}) {
  return (
    <div className="mt-2">
      <h5>Review Bounty</h5>
      <p className="text-gray mb-4">
        Est quis sit irure exercitation id consequat cupidatat elit nulla velit
        amet ex.
      </p>
      {Object.entries(payload).map(([name, value]: [string, Value], key) => {
        if(!value) return null;
        return (
          <div className="d-flex border-top border-gray-700 py-3 px-2" key={key}>
            <div className="col-3 text-gray">
              {name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ")}
            </div>
            <div className="col-9">
              {isArray(value) ? (
                <div className="d-flex">
                  {value.map((item, key) => (
                    <div className="d-flex" key={key}>
                      <div className="tag-ball mt-2 mx-2" key={key}/>
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                value
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}
