import Pagination from '@vlsergey/react-bootstrap-pagination';
import usePage from '../x-hooks/use-page';

export default function Paginate({count = 1, onChange = (evt: string) => {}}) {
  const page = usePage();

  function handleOnChange({target: {value}}) {
    onChange(value+1);
  }

  if (!count || count <= 10)
    return <></>;

  return <div className="w-100 d-flex justify-content-center">
    <Pagination totalPages={Math.ceil(count / 10)}
                value={+page - 1}
                showFirstLast={false}
                atBeginEnd={4}
                aroundCurrent={1} onChange={handleOnChange} />
  </div>
}
