export const isSameSet = (s1, s2) => {
  const isContain = (aSet, bSet) => ![...aSet].some((item) => !bSet.has(item))

  return isContain(s1, s2) && isContain(s2, s1)
}

export const orderByProperty = (elements, property, order) => {
  return elements.sort((elA, elB) => {
    if (elA[property] < elB[property]) return -1 * (order === 'desc' ? -1 : 1)
    if (elA[property] > elB[property]) return 1 * (order === 'desc' ? -1 : 1)

    return 0
  })
}
