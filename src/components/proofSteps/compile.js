/*
  zk-program cache related utils

  The idea is to store cache files in google cloud storage
  fetch them before compilation and pass it over as FileSystem
  to the compilation step

  TODO: store cache files in local storage so it won't we doenloaded again and again?
*/

const getCacheFiles = async (proofName) => {
  console.log(`fetching cache of ${proofName}`)

  const cacheFileByProof = {
    proofOfAge: [
      { name:'srs-fp-65536', type: 'string' },
      { name:'srs-fq-32768', type: 'string' },
      { name:'lagrange-basis-fp-16384', type: 'string' },
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
    proofOfNationality: [
      { name:'srs-fp-65536', type: 'string' },
      { name:'srs-fq-32768', type: 'string' },
      { name:'lagrange-basis-fp-16384', type: 'string' },
      { name:'lagrange-basis-fq-8192', type: 'string' },
      { name:'step-pk-zkproofofnationality-provenationality', type: 'string' },
      { name:'step-vk-zkproofofnationality-provenationality', type: 'string' },
      { name:'wrap-pk-zkproofofnationality', type: 'string' },
      { name:'wrap-vk-zkproofofnationality', type: 'string' },
    ],
  }

  const fetchFiles = async (proofName) => {
    const files = cacheFileByProof[proofName];
    const url = `https://storage.googleapis.com/id-mask-config/cache/${proofName}/`;

    return Promise.all(files.map((file) => {
      return Promise.all([
        fetch(`${url}${file.name}.header`).then(res => res.text()),
        fetch(`${url}${file.name}`).then(res => res.text())
      ]).then(([header, data]) => ({ file, header, data }))
    }))
    .then((cacheList) => cacheList.reduce((acc, { file, header, data }) => {
      acc[file.name] = { file, header, data }
      return acc
    }, {}));
  }

  const cacheFiles = await fetchFiles(proofName);
  return cacheFiles;
}

const FileSystem = (files) => ({
  read({ persistentId, uniqueId, dataType }) {
    if (!files[persistentId]) {
      console.log('read');
      console.log({ persistentId, uniqueId, dataType });
      return undefined;
    }
    const currentId = files[persistentId].header;
    if (currentId !== uniqueId) {
      console.log('current id did not match persistent id');
      return undefined;
    }
    if (dataType === 'string') {
      console.log('found in cache', { persistentId, uniqueId, dataType });
      return new TextEncoder().encode(files[persistentId].data);
    }
    return undefined;
  },
  write({ persistentId, uniqueId, dataType }, data) {},
  canWrite: true,
});

const compile = async (store, proofName, proof, { useCache = true } = {}) => {
  const proofData = store.state.proofs.data[proofName];
  if (proofData.verificationKey) {
    return; // exit early if verification key is already present
  }

  console.log('start compiling', proofName);
  console.time('compiling');
  
  let verificationKey, cacheFiles;
  try {
    if (useCache) {
      cacheFiles = await getCacheFiles(proofName);
      ({ verificationKey } = await proof.compile({ cache: FileSystem(cacheFiles) }));
    } else {
      ({ verificationKey } = await proof.compile());
    }

    console.timeEnd('compiling');
    store.state.proofs.data[proofName].verificationKey = verificationKey;
  } catch (error) {
    console.error('Error compiling:', error);
  }
};

export {
  compile,
};
