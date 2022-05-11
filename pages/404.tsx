import Button from '@components/button';
import Link from 'next/link'
import NotFoundIcon from '../assets/icons/not-found-icon';

export default function NotFound() {
  return <>
      <div className="row mt-5 pt-5">
        <div className="col d-flex justify-content-center mt-5 pt-5">
          <NotFoundIcon />
        </div>
      </div>
      <div className="row my-auto pt-4">
        <div className="d-flex flex-column justify-content-center text-center">
          <h2 className="h2 text-white text-opacity-1 mb-2">
            The page you looking for was{" "}
            <span className="text-blue">not found.</span>
          </h2>
          <p className="mb-2">
            The link you followed may be broken or the page may have been moved.
          </p>
          <Link href="/">
            <Button className="mt-3">
              back to homepage
            </Button>
          </Link>
        </div>
      </div>
  </>
}
