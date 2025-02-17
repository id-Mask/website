import { ref } from 'vue'
import { useStore } from 'vuex'
import { createPasskeys, usePasskeys } from './passkeysUtils.js'
import { Field } from 'o1js'
import {
  PassKeysParams,
  Secp256r1,
  EcdsaP256,
  encodeToAsciiNumber
} from '../../zkPrograms/proof.utils.js'

export const showModal = ref(false)
const modalResolve = ref(null)

export const usePasskeysSetup = () => {
  const store = useStore()

  const handleModal = () => {
    return new Promise((resolve) => {
      modalResolve.value = resolve;
      showModal.value = true;
    });
  }

  const handleChoice = async (choice) => {
    try {
      if (choice === 'create') {
        await createPasskeys()
      }
      const passkeysValues = await usePasskeys()
      const result = new PassKeysParams({
        id: Field(encodeToAsciiNumber(passkeysValues.id)),
        publicKey: Secp256r1.fromHex(passkeysValues.publicKeyHex),
        payload: Secp256r1.Scalar.from(passkeysValues.payloadHex),
        signature: EcdsaP256.fromHex(passkeysValues.signatureHex),
      })
       // Resolve the promise with the result
      if (modalResolve.value) {
        modalResolve.value(result);
      }
    } catch (error) {
      console.error(error)
       // Resolve the promise with null in case of error
      if (modalResolve.value) {
        modalResolve.value(null);
      }
    }
    showModal.value = false
  }

  const setupPasskeys = async () => {
    if (!store.state.settings.passkeysOptions.requestPasskeysSignature) {
      return new PassKeysParams({
        id: Field(encodeToAsciiNumber(store.state.settings.passkeysOptions.defaultSignatureValues.id)),
        publicKey: Secp256r1.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.publicKeyHex),
        payload: Secp256r1.Scalar.from(store.state.settings.passkeysOptions.defaultSignatureValues.payloadHex),
        signature: EcdsaP256.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.signatureHex),
      })
    }

    try {
      const passkeysValues = await usePasskeys()
      return new PassKeysParams({
        id: Field(encodeToAsciiNumber(passkeysValues.id)),
        publicKey: Secp256r1.fromHex(passkeysValues.publicKeyHex),
        payload: Secp256r1.Scalar.from(passkeysValues.payloadHex),
        signature: EcdsaP256.fromHex(passkeysValues.signatureHex),
      })
    } catch (error) {
      const result = await handleModal()
      if (!result) {
        throw new Error('Passkeys setup failed')
      }
      return result
    }
  }

  return {
    showModal,
    handleChoice,
    setupPasskeys
  }
}
