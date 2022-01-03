import { useRouter } from 'next/router'

import ReactSelect from '@components/react-select'

interface Option {
  value: string
  label: string
  sortBy: string
  order: string
}

interface ListSortProps {
  defaultOptionIndex?: number
  options: Option[]
}

export default function ListSort({
  defaultOptionIndex = 0,
  options
}: ListSortProps) {
  const router = useRouter()
  const { sortBy, order } = router.query

  function handleSelectChange(newValue) {
    const query = {
      ...router.query,
      sortBy: newValue.sortBy,
      order: newValue.order
    }

    router.push({ pathname: `${router.pathname}`, query }, router.pathname)
  }

  function getDefaultValue(): Option {
    if (sortBy && order) {
      const optionExists = options.find(
        (option) => option.sortBy === sortBy && option.order === order
      )

      if (optionExists) return optionExists
    }

    return options[defaultOptionIndex]
  }

  return (
    <ReactSelect
      defaultValue={getDefaultValue()}
      options={options}
      onChange={handleSelectChange}
    />
  )
}
