import InternalLink from '@components/internal-link';
import NotFoundIcon from '../assets/icons/not-found-icon';

export default function NotFound() {
  return <>
    <div className="row mt-5 pt-5">
      <div className="col d-flex justify-content-center mt-5 pt-5">
        <NotFoundIcon height={131} width={118}/>
      </div>
    </div>
    <div className="row my-auto pt-4">
      <div className="col text-center">
        <h2 className="h2 text-white text-opacity-1 mb-2">
          The page you looking for was{" "}
          <span className="text-blue">not found.</span>
        </h2>
        <p className="mb-2">
          The link you followed may be broken or the page may have been moved.
        </p>
        <div className='d-flex justify-content-center align-items-center'>
          <InternalLink href="/" className="mt-3" active>
            back to homepage
          </InternalLink>
        </div>
      </div>
    </div>
  </>
}
