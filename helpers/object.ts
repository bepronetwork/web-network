export function getPropertyRecursively<T> (property: string, data = {}): T[keyof T] {
  if (data[property]) return data[property];

  let found = {};

  for(const key in data) found = getPropertyRecursively(property, data[key]);

  return found as T[keyof T];
}