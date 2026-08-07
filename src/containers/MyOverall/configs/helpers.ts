export const normalizeArray = <T>(arr: T[], length: number, replacement: any): Array<T | null> =>
    arr.length >= length
      ? arr.slice(0, length)
      : [...arr, ...Array(length - arr.length).fill(replacement)];

export const checkEmptyValue = (data: any[]) => {
  if(!data?.length) return false
  return data?.some(Boolean)
}