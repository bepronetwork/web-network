export const isSameSet = (s1, s2) => {
  const isContain = (aSet, bSet) => ![...aSet].some((item) => !bSet.has(item))

  return isContain(s1, s2) && isContain(s2, s1)
}
