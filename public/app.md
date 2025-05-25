# ID-Mask

## App Overview

This app empowers users to create **zero-knowledge proofs (ZKPs)** about themselves—secure, privacy-preserving attestations that reveal nothing beyond the fact being proven.

Built with a strong focus on **client-side operations**, the app fetches personal data using **Smart-ID** directly in the browser. This data is then passed into **predefined zero-knowledge circuits** to generate cryptographic proofs entirely on the user's device.

Users can store these proofs in their **Google Wallet**, **Apple Wallet**, or publish them on the **Mina Protocol L1** blockchain.

When needed, users present their proof via a **QR code**. The proof verifier sees only the specific fact (e.g., "I am over 18")—**no additional personal data is exposed**.

This app brings real-world utility to privacy-first identity verification.

---

## Preventing Proof Sharing

A key challenge with zero-knowledge proofs is preventing them from being **shared and reused by others**. For example, someone could attempt to use their older sibling’s proof of age to falsely claim they are over 21.

To solve this, our app embeds a **passkey pair** into each proof at creation time. These passkeys are cryptographic credentials unique to the user and device.

Inside the zero-knowledge circuit, a **signature using this passkey pair** is verified. As a result, the **public key** (or a pointer to it) becomes part of the proof's **public output**.

When presenting a proof, the user must **sign a challenge using their passkey**. The proof consumer verifies this signature against the public key embedded in the proof, ensuring that:

- The presenter is the **same individual** who originally created the proof.
- The proof **has not been shared** or reused by anyone else.

This mechanism ensures that **proofs are bound to individuals** and cannot be transferred or misused by others.

---

## What Is a Proof?

A **proof** is a JSON object containing cryptographic evidence that a certain fact (e.g., being over 18) is true, without revealing any additional personal data.

Each proof includes:

- `publicInput`: The value being proven (e.g., `"5"` means "prove age ≥ 5").
- `publicOutput`: Public values that allow anyone to verify the proof.
- `proof`: The actual zero-knowledge proof string.
- `maxProofsVerified`: Currently unused (`0` by default).

### Example Proof of age with explanation

```js
{
  "publicInput": ["5"],              // Proving: age ≥ 5
  "publicOutput": [
    "5",                             // [0] Years to prove
    "20250525",                      // [1] Proof creation date (YYYYMMDD)
    "80987473785...969161318090",    // [2–3] Mina wallet public key (split into two parts)
    "0",                                            
    "14787152154564119254483407",    // [4–6] Passkey public key (x-coordinates)
    "63391986999191009329240727",
    "15785887159263306888538961",                    
    "73727926632129849938683848",    // [7–9] Passkey public key (y-coordinates)
    "86587147207223338757045216",
    "11096342160664184776357244",                   
    "8150879811412...8011810765",    // [10] WebAuthn key ID
    "1"                              // [11] Is personal data mocked? ("1" = yes, "0" = no)
  ],
  "maxProofsVerified": 0,
  "proof": "KChzdGF0b...nQoKyb29mX"  // Zero-knowledge proof string
}
```

---

## Types of Proofs

| 🧾 Proof Type           | 🔍 What It Does                                                 | 🌐 Use Cases                                         | 🛡️ Why It Matters                                            |
|------------------------|------------------------------------------------------------------|------------------------------------------------------|--------------------------------------------------------------|
| 👵 Proof of Age         | Proves you're older than a specific number of years              | Age-restricted sites, alcohol purchases, entry gates | Verifies age without revealing birthdate or identity         |
| 📜 Proof of Non-Sanctions | Proves you're not on OFAC or similar sanctions lists            | Financial services, crypto exchanges, compliance     | Enables checks without exposing personal identity            |
| 🧠 Proof of Unique Human | Proves you're a single, real, untrackable person                 | Voting, airdrops, Sybil resistance in web3           | Prevents bots and duplicate users while preserving privacy   |
| 🏛️ Proof of Nationality  | Proves which country issued your ID                             | National ID checks, citizenship programs, residency  | Confirms nationality without sharing full ID details         |
