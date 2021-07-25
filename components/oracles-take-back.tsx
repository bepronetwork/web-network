import OraclesTakeBackItem from "./oracles-take-back-item";

const items: { amount: number; address: string }[] = [
  {
    amount: 200000,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    amount: 150000,
    address: "yrf2493p83kkfjhx0wlhbc1qxy2kgdygjrsqtzq2n0",
  },
];

export default function OraclesTakeBack(): JSX.Element {
  return (
    <div className="col-md-10">
      <div className="content-wrapper mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="h4 mb-0">Delegated Oracles</h4>
          <span className="badge-opac">200 Available</span>
        </div>
        <div className="row">
          <div className="col">
            {items.map((item) => (
              <OraclesTakeBackItem
                key={item.address}
                address={item.address}
                amount={item.amount}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
