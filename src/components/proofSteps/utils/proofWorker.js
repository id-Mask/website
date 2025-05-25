// src/workers/proofWorker.js
import * as Comlink from 'comlink'

import { proofOfAge } from '../../zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from '../../zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from '../../zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from '../../zkPrograms/ProofOfNationality.js'

import { verify, Field, VerificationKey } from 'o1js'
import { PersonalData, CreatorAccount, PassKeys } from '../../zkPrograms/proof.utils.js'
import { SanctionsData } from '../../zkPrograms/ProofOfSanctions.utils.js'
import { PersonalSecretValue } from '../../zkPrograms/ProofOfUniqueHuman.utils.js'

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

  async verify(proof, verificationKey) {
    const vk = new VerificationKey({
      data: verificationKey.data,
      hash: Field(verificationKey.hash)
    })
    return await verify(proof, vk);
  },

  // run zk-program methods
  async proveAge(...args) {
    const [ageToProveInYears, personalDataJson, creatorAccountJson, passkeysJson] = args;
    const { proof } = await proofs['proofOfAge'].proveAge(
      Field(ageToProveInYears),
      new PersonalData(personalDataJson),
      new CreatorAccount(creatorAccountJson),
      new PassKeys(passkeysJson),
    );

    return proof.toJSON()
  },

  async proveSanctions(...args) {
    const [sanctionsDataJson, personalDataJson, creatorAccountJson, passkeysJson] = args;
    const { proof } = await proofs['proofOfSanctions'].proveSanctions(
      new SanctionsData(sanctionsDataJson),
      new PersonalData(personalDataJson),
      new CreatorAccount(creatorAccountJson),
      new PassKeys(passkeysJson),
    );
    return proof.toJSON()
  },

  async proveUniqueHuman(...args) {
    const [personalDataJson, personalSecretDataJson, creatorAccountJson, passkeysJson] = args;
    const { proof } = await proofs['proofOfUniqueHuman'].proveUniqueHuman(
      new PersonalData(personalDataJson),
      new PersonalSecretValue(personalSecretDataJson),
      new CreatorAccount(creatorAccountJson),
      new PassKeys(passkeysJson),
    );
    return proof.toJSON()
  },

  async proveNationality(...args) {
    const [personalDataJson, creatorAccountJson, passkeysJson] = args;
    const { proof } = await proofs['proofOfNationality'].proveNationality(
      new PersonalData(personalDataJson),
      new CreatorAccount(creatorAccountJson),
      new PassKeys(passkeysJson),
    );
    return proof.toJSON()
  },

};

Comlink.expose(workerApi);
