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

/*
  zk-program cache related utils

  The idea is to store cache files in google cloud storage
  fetch them before compilation and pass it over as FileSystem
  to the compilation step
*/

export const getCacheFiles = async (proof) => {

  // TODO: now the compilation step just freezes, this needs fixing
  // discord example: https://discord.com/channels/484437221055922177/1171938451193593856/1172278495519461418

  // TODO: implement proof selection
  console.log(`fetching cache of ${proof}`)

  // TODO: figure out which files are needed !!!
  const files = [
    { name:'srs-fp-65536', type: 'string' },
    { name:'srs-fq-32768', type: 'string' },
    { name:'wrap-vk-zkproofofage', type: 'string' },
    { name:'step-vk-zkproofofage-proveage', type: 'string' },
  ]

  const fetchFiles = async () => {
    const url = 'https://storage.googleapis.com/id-mask-config/cache/'
    return Promise.all(files.map((file) => {
      return Promise.all([
        fetch(`${url}${file.name}.header`).then(res => res.text()),
        fetch(`${url}${file.name}`).then(res => res.text())
      ]).then(([header, data]) => ({ file, header, data }))
    }))
    .then((cacheList) => cacheList.reduce((acc, { file, header, data }) => {
      acc[file.name] = { file, header, data }
      return acc
    }, {}))
  }

  const cacheFiles = await fetchFiles()
  return cacheFiles
}

export const FileSystem = (files) => ({
  read({ persistentId, uniqueId, dataType }) {
    if (!files[persistentId]) {
      console.log('read')
      console.log({ persistentId, uniqueId, dataType })
      return undefined
    }
    const currentId = files[persistentId].header
    if (currentId !== uniqueId) {
      console.log('current id did not match persistent id')
      return undefined
    }
    if (dataType === 'string') {
      console.log('found in cache', { persistentId, uniqueId, dataType })
      return new TextEncoder().encode(files[persistentId].data)
    }
    return undefined
  },
  write({ persistentId, uniqueId, dataType }, data) {},
  canWrite: true,
})