export function removeDuplicateByProperty(items, uniqueProperty) {
  const uniqueArray = []

  if (items) {
    items.forEach((item) => {
      if (
        item.hasOwnProperty(uniqueProperty) &&
        !uniqueArray.find((el) => el[uniqueProperty] === item[uniqueProperty])
      )
        uniqueArray.push(item)
    })
  }

  return uniqueArray
}
