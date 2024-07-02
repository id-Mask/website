import { useBreakpoint, useMemo } from 'vooks'

export function useIsMobile () {
  const breakpointRef = useBreakpoint()
  return useMemo(() => {
    return breakpointRef.value === 'xs'
  })
}

// https://stackoverflow.com/a/73468350
export const merge = (object1, object2) => {
  if (Array.isArray(object2)) {
    return [...object1, ...object2]
  } else {
    return Object.entries(object2).reduce((acc, [key, value]) => {
      if (
        Object.keys(acc).includes(key) &&
        typeof value === 'object'
      ) {
        acc[key] = merge(acc[key], value)
      } else {
        acc[key] = value
      }

      return acc
    }, { ...object1 })
  }
}

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const parseDOB = (pno) => {

  // Extract relevant parts from the PNO
  const centuryCode = parseInt(pno[0], 10)
  const year = pno.slice(1, 3)
  const month = pno.slice(3, 5)
  const day = pno.slice(5, 7)

  // Determine the century based on the first digit
  let century
  if (centuryCode === 1 || centuryCode === 2) {
      century = 1800
  } else if (centuryCode === 3 || centuryCode === 4) {
      century = 1900
  } else if (centuryCode === 5 || centuryCode === 6) {
      century = 2000
  } else {
      throw new Error('Invalid century code in PNO')
  }

  // Construct the full year
  const fullYear = century + parseInt(year, 10)

  // Return the formatted date of birth
  return `${fullYear}-${month}-${day}`
}