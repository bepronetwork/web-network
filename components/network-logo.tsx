import Image from 'next/image'

interface NetworkLogoProps {
  src: string,
  alt?: string
}

export default function NetworkLogo({
  src,
  ...props
} : NetworkLogoProps) {
  return(
    <div className="network-logo bg-dark d-flex align-items-center justify-content-center rounded-circle">
      <Image src={src} {...props} width={24} height={24} />
    </div>
  )
}