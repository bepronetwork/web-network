import ArrowDown from '@assets/icons/arrow-down'
import NetworkListBarColumn from './network-list-bar-column'

export default function NetworkListBar({ hideOrder = false, order, setOrder }) {
  const textClass = hideOrder ? 'text-primary' : ''
  const invertOrder = order[1] === 'asc' ? 'desc' : 'asc'

  function handleSetOrder(column) {
    const newOrder = order[0] === column ? invertOrder : 'asc'

    setOrder([column, newOrder])
  }

  return (
    <div className="row py-0 mx-0 mb-2 svg-with-text-color">
      <NetworkListBarColumn
        label="Network Name"
        hideOrder={hideOrder}
        columnOrder={order[1]}
        isColumnActive={order[0] === 'name'}
        onClick={() => handleSetOrder('name')}
      />

      <NetworkListBarColumn
        hideOrder={hideOrder}
        columnOrder={order[1]}
        label="Number of bounties"
        isColumnActive={order[0] === 'openBountiesQuantity'}
        onClick={() => handleSetOrder('openBountiesQuantity')}
      />

      <NetworkListBarColumn
        hideOrder={hideOrder}
        label="$TOKEN Locked"
        columnOrder={order[1]}
        isColumnActive={order[0] === 'tokensLocked'}
        onClick={() => handleSetOrder('tokensLocked')}
      />

      <NetworkListBarColumn
        hideOrder={hideOrder}
        label="Open bounties"
        columnOrder={order[1]}
        isColumnActive={order[0] === 'openBountiesAmount'}
        onClick={() => handleSetOrder('openBountiesAmount')}
      />
    </div>
  )
}
