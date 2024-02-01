/*
  zk-program cache related utils

  The idea is to store cache files in google cloud storage
  fetch them before compilation and pass it over as FileSystem
  to the compilation step

  TODO: store cache files in local storage so it won't we doenloaded again and again?
*/

const getCacheFiles = async (proof) => {
  console.log(`fetching cache of ${proof}`)

  const cacheFileByProof = {
    proofOfAge: [
      { name:'srs-fp-65536', type: 'string' },
      { name:'srs-fq-32768', type: 'string' },
      { name:'lagrange-basis-fp-8192', type: 'string' },
      { name:'lagrange-basis-fq-8192', type: 'string' },
      { name:'step-pk-zkproofofage-proveage', type: 'string' },
      { name:'step-vk-zkproofofage-proveage', type: 'string' },
      { name:'wrap-pk-zkproofofage', type: 'string' },
      { name:'wrap-vk-zkproofofage', type: 'string' },
    ],
    proofOfSanctions: [
      { name:'srs-fp-65536', type: 'string' },
      { name:'srs-fq-32768', type: 'string' },
      { name:'lagrange-basis-fp-16384', type: 'string' },
      { name:'lagrange-basis-fp-2048', type: 'string' },
      { name:'lagrange-basis-fq-8192', type: 'string' },
      { name:'step-pk-zkproofofsanctions-provesanctions', type: 'string' },
      { name:'step-vk-zkproofofsanctions-provesanctions', type: 'string' },
      { name:'wrap-pk-zkproofofsanctions', type: 'string' },
      { name:'wrap-vk-zkproofofsanctions', type: 'string' },
    ],
    proofOfUniqueHuman: [
      { name:'srs-fp-65536', type: 'string' },
      { name:'srs-fq-32768', type: 'string' },
      { name:'lagrange-basis-fp-16384', type: 'string' },
      { name:'lagrange-basis-fq-8192', type: 'string' },
      { name:'step-pk-zkproofofuniquehuman-proveuniquehuman', type: 'string' },
      { name:'step-vk-zkproofofuniquehuman-proveuniquehuman', type: 'string' },
      { name:'wrap-pk-zkproofofuniquehuman', type: 'string' },
      { name:'wrap-vk-zkproofofuniquehuman', type: 'string' },
    ],
  }

  const files = cacheFileByProof[proof]

  const fetchFiles = async () => {
    const url = `https://storage.googleapis.com/id-mask-config/cache/${proof}/`
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

const FileSystem = (files) => ({
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

const compile = async (store, proofName, proof) => {
  const hasVk = store.state.proofs.data[proofName].verificationKey
  if (!hasVk) {
    console.log('start compiling', proofName)
    const cacheFiles = await getCacheFiles(proofName)
    console.time('compiling')
    const { verificationKey } = await proof.compile({ cache: FileSystem(cacheFiles) });
    store.state.proofs.data[proofName].verificationKey = verificationKey
    console.timeEnd('compiling')
  }
}

export {
  compile,
}