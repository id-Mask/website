// src/workers/proofWorker.js
import * as Comlink from 'comlink'

import { proofOfAge } from '../../zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from '../../zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from '../../zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from '../../zkPrograms/ProofOfNationality.js'

import { verify, Field, VerificationKey } from 'o1js'
import { PersonalData, CreatorAccount, PassKeys } from '../../zkPrograms/proof.utils.js'

const proofs = {
  proofOfAge,
  proofOfSanctions,
  proofOfUniqueHuman,
  proofOfNationality,
};

const workerApi = {
  // compile
  async compile(proofName) {
    return await proofs[proofName].compile();
  },

  // verify
  async verify(proof, verificationKey) {
    console.log(verificationKey)
    const vk = new VerificationKey()
    return await verify(proof, vk.fromJSON(verificationKey));
  },

  // run zk-program methods
  async proveAge(...args) {
    console.time('proofing age');
    const [ageToProveInYears, personalDataJson, creatorAccountJson, passkeysJson] = args;
    const { proof } = await proofs['proofOfAge'].proveAge(
      Field(ageToProveInYears),
      new PersonalData(personalDataJson),
      new CreatorAccount(creatorAccountJson),
      new PassKeys(passkeysJson),
    );
    console.timeEnd('proofing age');
    return proof.toJSON()
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
