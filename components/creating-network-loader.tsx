import LoadingDots from '@assets/icons/loading-dots'

export default function CreatingNetworkLoader() {
  return (
    <div className="creating-network-loader">
      <div className="d-flex flex-row align-items-end">
        <span className="caption-large text-white">Your network is being prepared</span> <LoadingDots />
      </div>
      <p className="caption-medium text-gray mt-1">
        Please don't close this window
      </p>
    </div>
  )
}
