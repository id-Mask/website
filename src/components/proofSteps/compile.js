
const getCache = async () => {
 /*
  * Use google cloud bucket to download the cache files.
  * TODO: figure out how to save the files so that it's possible to pass them to the cache as dir.
  * How about we overwrite cache.read fn, to read for example from localStorage / sessionStorage? 
  */

  const fetchCache = false
  if (fetchCache) {
    const url = 'https://storage.googleapis.com/idmask/'
    const files = [
      'step-pk-zkproofofage-proveage.header',
      'step-pk-zkproofofage-proveage',
    ]
    
    for (let file of files) {
      const response = await fetch(url + file)
      const blob = await response.blob()
      const localFilePath = `./cache/${file}`
      const file_ = new File([blob], localFilePath)
      console.log(file, file_)
    }
  }

  const cache = Cache.FileSystem('./cache')
  return cache
}

const compile = async (store, props, proof) => {
  console.log('compiling', proof)
  const hasVk = store.state.proofs.data[props.selectedProof].verificationKey
  if (!hasVk) {
    console.time('compiling')
    const { verificationKey } = await proof.compile();
    store.state.proofs.data[props.selectedProof].verificationKey = verificationKey
    console.timeEnd('compiling')
  }
}

export {
  compile,
}