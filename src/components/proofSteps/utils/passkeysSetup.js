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

/*
Passkeys Setup Flow Explained:

This module handles the creation, retrieval, and interactive user confirmation of passkeys using Vue's reactivity, Promises, and external cryptographic utilities. 
It ensures that passkeys are either retrieved automatically or created interactively if retrieval fails.

The flow is as follows:

1. **Initialization**: 
   - `showModal` (ref) indicates if the modal should be visible.
   - `modalResolve` (ref) stores the resolve function of the modal's promise.

2. **Main Function - setupPasskeys**:
   - Checks if `requestPasskeysSignature` is disabled. If disabled, it returns default passkeys immediately.
   - If enabled, it tries to retrieve passkeys using `usePasskeys()`.
   - On success, constructs `PassKeysParams` and returns it.
   - On failure, it calls `handleModal()` to show the modal, waiting for the user to take action.
   - If the user action yields a valid result, it returns that result; otherwise, it throws a "Passkeys setup failed" error.

3. **User Interaction - handleModal**:
   - Creates a new Promise and sets its resolve function to `modalResolve`.
   - Sets `showModal` to `true` to display the modal.
   - The modal will remain visible until `handleChoice` is called.

4. **Modal Action - handleChoice**:
   - Takes a user `choice` (e.g., 'create').
   - If the user chooses 'create', it calls `createPasskeys()`.
   - Then retrieves passkeys using `usePasskeys()`.
   - If retrieval succeeds, it constructs `PassKeysParams` and resolves the promise stored in `modalResolve`.
   - If retrieval fails, it logs the error and resolves the promise with `null`.
   - Finally, it sets `showModal` to `false` to hide the modal.

### Timeline with Visual Representation:

```plaintext
setupPasskeys()
    └─> usePasskeys()  → Success → Return PassKeysParams
                  └─> Failure → handleModal()
                                   └─> showModal = true
                                        ↓
                              User interacts with modal
                                        ↓
                           handleChoice(choice)
                                ├─> choice = 'create' → createPasskeys() → usePasskeys() → Success → Resolve promise with PassKeysParams
                                ├─> failure → Resolve promise with null
                                └─> showModal = false
*/

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
        await createPasskeys();
      }
      const passkeysValues = await usePasskeys();
      const result = new PassKeysParams({
        id: Field(encodeToAsciiNumber(passkeysValues.id)),
        publicKey: Secp256r1.fromHex(passkeysValues.publicKeyHex),
        payload: Secp256r1.Scalar.from(passkeysValues.payloadHex),
        signature: EcdsaP256.fromHex(passkeysValues.signatureHex),
      });
  
      if (modalResolve.value) {
        modalResolve.value(result);
      }
      showModal.value = false; // Only close when success
    } catch (error) {
      console.error('Error in handleChoice:', error);
      // Do NOT resolve the promise; keep the modal open
    }
  };

  const setupPasskeys = async () => {
    if (!store.state.settings.passkeysOptions.requestPasskeysSignature) {
      return new PassKeysParams({
        id: Field(encodeToAsciiNumber(store.state.settings.passkeysOptions.defaultSignatureValues.id)),
        publicKey: Secp256r1.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.publicKeyHex),
        payload: Secp256r1.Scalar.from(store.state.settings.passkeysOptions.defaultSignatureValues.payloadHex),
        signature: EcdsaP256.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.signatureHex),
      });
    }
  
    while (true) {
      try {
        const passkeysValues = await usePasskeys();
        console.log('passkeys values', passkeysValues)
        return new PassKeysParams({
          id: Field(encodeToAsciiNumber(passkeysValues.id)),
          publicKey: Secp256r1.fromHex(passkeysValues.publicKeyHex),
          payload: Secp256r1.Scalar.from(passkeysValues.payloadHex),
          signature: EcdsaP256.fromHex(passkeysValues.signatureHex),
        });
      } catch (error) {
        const result = await handleModal();
        if (result) {
          return result;
        }
        // Modal stays open if result is falsy
      }
    }
  };
  

  return {
    showModal,
    handleChoice,
    setupPasskeys
  }
}
