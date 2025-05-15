// src/workers/proofWorker.js
import * as Comlink from 'comlink'

import { proofOfAge } from '../../zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from '../../zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from '../../zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from '../../zkPrograms/ProofOfNationality.js'

const proofs = {
  proofOfAge,
  proofOfSanctions,
  proofOfUniqueHuman,
  proofOfNationality,
};

const workerApi = {
  async compile(proofName) {
    return await proofs[proofName].compile();
  },
  async proveAge(...args) {
    return await proofs['proofOfAge'].proveAge(...args);
  },
  async proveSanctions(...args) {
    return await proofs['proofOfSanctions'].proveSanctions(...args);
  },
  async proveUniqueHuman(...args) {
    return await proofs['proofOfUniqueHuman'].proveUniqueHuman(...args);
  },
  async proveNationality(...args) {
    return await proofs['proofOfNationality'].proveNationality(...args);
  },
};

Comlink.expose(workerApi);
