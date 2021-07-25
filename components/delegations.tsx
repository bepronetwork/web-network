import DelegateOrableTakeBack from "./delegate-oracle-take-back";

export default function Delegations({
  oracles = [],
}: {
  oracles: Array<{ amount: number; key: string }>;
}): JSX.Element {
  return (
    <>
      {oracles.map(({ amount, key }) => (
        <div key={key} className="bg-opac w-100 mb-1 p-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="p-small text-bold color-purple mb-1">{amount}</p>
              <p className="p-small mb-0">{key}</p>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <DelegateOrableTakeBack amount={amount} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
