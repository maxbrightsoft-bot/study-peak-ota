export const isNull = (value: any) => {
  if(Array.isArray(value)) {
    return !value[0]
  }
  return !value
}