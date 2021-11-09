import { formatNumberToString } from '@helpers/formatNumber'

interface BalanceAddressAvatarProps {
  address: string
  balance: number
  currency: string
}

export default function BalanceAddressAvatar(props: BalanceAddressAvatarProps) {
  return (
    <div className="d-flex flex-column text-right">
      <p className="p-small mb-0">{props.address}</p>
      <p className="p-small mb-0 trans">
        {formatNumberToString(props.balance)} {props.currency}
      </p>
    </div>
  )
}
