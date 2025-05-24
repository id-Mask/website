import { ref } from 'vue'
import { useStore } from 'vuex'
import { createPasskeys, usePasskeys, parsePublicKeyHex, bufferToBase64 } from './passkeysUtils.js'
import { PassKeys } from '../../zkPrograms/proof.utils.js'

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
   - On success, constructs `PassKeys` and returns it.
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
   - If retrieval succeeds, it constructs `PassKeys` and resolves the promise stored in `modalResolve`.
   - If retrieval fails, it logs the error and resolves the promise with `null`.
   - Finally, it sets `showModal` to `false` to hide the modal.

### Timeline with Visual Representation:

```plaintext
setupPasskeys()
    └─> usePasskeys()  → Success → Return PassKeys
                  └─> Failure → handleModal()
                                   └─> showModal = true
                                        ↓
                              User interacts with modal
                                        ↓
                           handleChoice(choice)
                                ├─> choice = 'create' → createPasskeys() → usePasskeys() → Success → Resolve promise with PassKeys
                                ├─> failure → Resolve promise with null
                                └─> showModal = false
*/

export const showModal = ref(false)
const modalResolve = ref(null)

/*
  helper functions to save { id: publicKey } to db and fetch it back
*/
const savePasskeysIdAndPublicKey = async (credential, zkOracleUrl) => {
  const publicKeyHex = parsePublicKeyHex(credential.response.attestationObject);
  const id = bufferToBase64(credential.rawId).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const response = await fetch(`${zkOracleUrl}/passkeys/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [id]: publicKeyHex })
  });
  const result = await response.json();
  console.log('saved response', result)
}

const fetchPasskeysIdAndPublicKey = async (id, zkOracleUrl) => {
  const response = await fetch(`${zkOracleUrl}/passkeys/fetch/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const passkeys = await response.json();
  console.log('fetched response', passkeys)
  return passkeys
}

/*
  main setup funtion
*/
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
        const credential = await createPasskeys();
        await savePasskeysIdAndPublicKey(credential, store.state.settings.zkOracle);
      }
      const passkeysValues = await usePasskeys();
      const passkeysPk = await fetchPasskeysIdAndPublicKey(passkeysValues.id, store.state.settings.zkOracle)
      passkeysValues.publicKey = passkeysPk.value
      console.log(passkeysValues)
      const result = new PassKeys(passkeysValues);
  
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
      return new PassKeys(store.state.settings.passkeysOptions.defaultSignatureValues);
    }
  
    while (true) {
      try {
        const passkeysValues = await usePasskeys();
        const passkeysPk = await fetchPasskeysIdAndPublicKey(passkeysValues.id, store.state.settings.zkOracle)
        passkeysValues.publicKey = passkeysPk.value
        return new PassKeys(passkeysValues);
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
