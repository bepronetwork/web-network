export const getPropertyRecursively = (property, data) => {
  if (data[property]) return data[property];

  let found = {};

  for(const key in data) found = getPropertyRecursively(property, data[key]);

  return found;
};