import { Spinner } from "react-bootstrap";

export default function LoadingList({ loading = false }: { loading: boolean }) {
  if (loading)
    return (
        <div className="row mt-3 justify-content-center">
          <Spinner className="align-self-center p-2 mt-1" animation="border" />
        </div>
    );
    
  return null;
}