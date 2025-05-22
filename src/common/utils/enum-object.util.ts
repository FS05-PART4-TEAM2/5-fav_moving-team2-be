export function toEnumObject<T extends readonly { key: string }[]>(
  arr: T,
): Record<string, string> {
  return Object.fromEntries(arr.map((item) => [item.key, item.key]));
}
