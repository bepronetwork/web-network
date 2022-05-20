import { IStepper } from "interfaces/stepper";

export default function Stepper({ children }: IStepper) {
  return (
    <div className="row">
      <div className="col-12">
        <div className="stepper">{children}</div>
      </div>
    </div>
  );
}
