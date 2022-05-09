export function getPropertyRecursively<T> (property: string, data = {}): T[keyof T] {
  if (data[property]) return data[property];

  let found = null;

  const keys = Object.keys(data);

  for (let x = 0; x < keys.length && !found; x++) {
    found = getPropertyRecursively(property, data[keys[x]]);
  }

  return found as T[keyof T];
}