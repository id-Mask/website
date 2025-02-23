import { decodeFirstSync } from 'cbor-web';

// Helper function to decode base64url to Uint8Array
export const base64urlToBuffer = (base64url) => {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

// Helper function to encode Uint8Array to base64url
export const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

/*
  Parse public key from credentials.response.attestationObject
*/
export const parseAttestationObject = (attestationObject) => {
  // Decode the base64url to get the raw bytes
  // const attestationBuffer = base64urlToBuffer(attestationObject);

  // Decode the CBOR
  const attestationCbor = decodeFirstSync(attestationObject);

  // Get the authData from the attestation
  const { authData } = attestationCbor;

  // The public key starts after:
  // 32 bytes of RP ID hash
  // 1 byte of flags
  // 4 bytes of signature counter
  // 16 bytes of AAGUID
  // 2 bytes of credential ID length (L)
  // L bytes of credential ID
  let position = 32 + 1 + 4;

  // Skip AAGUID
  position += 16;

  // Get credential ID length
  const credentialIdLength = (authData[position] << 8) | authData[position + 1];
  position += 2;

  // Skip credential ID
  position += credentialIdLength;

  // The rest is the CBOR-encoded public key
  const publicKeyCose = authData.slice(position);
  const publicKeyObject = decodeFirstSync(publicKeyCose);

  // COSE key to JWK conversion
  // For ES256 (ECDSA with P-256 curve)
  const x = publicKeyObject.get(-2); // X coordinate
  const y = publicKeyObject.get(-3); // Y coordinate

  return {
    kty: 'EC',
    crv: 'P-256',
    x: bufferToBase64(x),
    y: bufferToBase64(y),
    ext: true,
  };
};

/*
  Parse the public key stored inside the attestationObject of credential:
*/
export const parsePublicKeyHex = (attestationObject) => {
  // Parse points
  const pk = parseAttestationObject(attestationObject);
  const xBuffer = base64urlToBuffer(pk.x);
  const yBuffer = base64urlToBuffer(pk.y);

  // Ensure both x and y are 32 bytes as expected for P-256
  if (xBuffer.length !== 32 || yBuffer.length !== 32) {
    throw new Error('Invalid x or y length for P-256 curve.');
  }

  // Create the uncompressed point buffer
  const uncompressedPoint = new Uint8Array([0x04, ...xBuffer, ...yBuffer]);
  const uncompressedPointHex = Array.from(uncompressedPoint)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const publicKeyHex = '0x' + uncompressedPointHex;

  return publicKeyHex;
};

/*
  Read the signed payload into hex payload = hash(concat(authenticatorData, hashedClientDataJSON)):
*/
export const parsePayloadHex = async (clientDataJSON, authenticatorData) => {
  if (!crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this browser.');
  }

  // const clientDataJSONBuffer = new TextEncoder().encode(clientDataJSON);
  const hashedClientDataJSON = await crypto.subtle.digest(
    'SHA-256',
    clientDataJSON
  );
  // const authenticatorDataBuffer = base64urlToBuffer(authenticatorData);
  // console.log(authenticatorData);

  // concatenate
  const payload = new Uint8Array(
    authenticatorData.byteLength + hashedClientDataJSON.byteLength
  );
  payload.set(new Uint8Array(authenticatorData), 0);
  payload.set(
    new Uint8Array(hashedClientDataJSON),
    authenticatorData.byteLength
  );

  const hashedPayload = await crypto.subtle.digest('SHA-256', payload);
  const payloadHex =
    '0x' +
    Array.from(new Uint8Array(hashedPayload))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return payloadHex;
};

/*
  Parse signature stored inside the assertion response:
*/
export const parseSignatureHex = (signature) => {
  const readAsn1IntegerSequence = (input) => {
    if (input[0] !== 0x30) throw new Error('Input is not an ASN.1 sequence');
    const seqLength = input[1];
    const elements = [];

    let current = input.slice(2, 2 + seqLength);
    while (current.length > 0) {
      const tag = current[0];
      if (tag !== 0x02)
        throw new Error('Expected ASN.1 sequence element to be an INTEGER');

      const elLength = current[1];
      elements.push(current.slice(2, 2 + elLength));
      current = current.slice(2 + elLength);
    }
    return elements;
  };

  const convertEcdsaAsn1Signature = (input) => {
    const elements = readAsn1IntegerSequence(input);
    if (elements.length !== 2)
      throw new Error('Expected 2 ASN.1 sequence elements');
    let [r, s] = elements;

    // Each component should be 32 bytes for P-256
    const targetLength = 32;

    // Handle leading zeros properly
    r = r[0] === 0 ? r.slice(1) : r;
    s = s[0] === 0 ? s.slice(1) : s;

    // Pad if shorter than 32 bytes
    if (r.length < targetLength) {
      r = new Uint8Array([
        ...new Uint8Array(targetLength - r.length).fill(0),
        ...r,
      ]);
    }
    if (s.length < targetLength) {
      s = new Uint8Array([
        ...new Uint8Array(targetLength - s.length).fill(0),
        ...s,
      ]);
    }

    // Verify final lengths
    if (r.length !== targetLength || s.length !== targetLength) {
      throw new Error(
        `Invalid R or S length. Expected ${targetLength} bytes each`
      );
    }

    return new Uint8Array([...r, ...s]);
  };

  const signatureBuffer = base64urlToBuffer(signature);
  const signature_ = convertEcdsaAsn1Signature(signatureBuffer);
  const signatureHex =
    '0x' +
    Array.from(signature_)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return signatureHex;
};


/*
  Proofs are provided with an id (pointer to public key) and a signature. 
  The zk-program validates the signature and gives back the id.
*/
const generateRandomChallenge = () => {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  return challenge;
};

export const createPasskeys = async () => {
  const base_name = 'id-mask-'
  const mini_uuid = Math.random().toString(36).slice(2, 6)
  const name = base_name.concat(mini_uuid)
  const publicKey = {
    rp: {
      name: name,
    },
    user: {
      id: Uint8Array.from(name, (c) => c.charCodeAt(0)),
      name: name,
      displayName: name,
    },
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7,
      },
    ],
    attestation: 'direct',
    timeout: 60000,
    challenge: generateRandomChallenge(),
  };

  const credential = await navigator.credentials.create({ publicKey })
  return credential
};

export const usePasskeys = async () => {
  const publicKey = {
    challenge: generateRandomChallenge(),
    allowCredentials: [],
    userVerification: 'preferred',
  };
  const assertion = await navigator.credentials.get({ publicKey });
  if (assertion) {
    const id = bufferToBase64(assertion.rawId).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const payloadHex = await parsePayloadHex(
      assertion.response.clientDataJSON,
      assertion.response.authenticatorData
    );

    const signatureHex = await parseSignatureHex(
      bufferToBase64(assertion.response.signature)
    );

    return {
      id: id,
      // publicKeyHex: passkeys.value,
      payloadHex: payloadHex,
      signatureHex: signatureHex,
    }
  }
};
