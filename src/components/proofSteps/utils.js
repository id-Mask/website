import {
  PrivateKey,
  Signature,
} from 'o1js'
/*
  Proofs are provided with a public key and a personal data signature. 
  The zk-program validates the signature and gives back the public key.

  This ensures we can later confirm if the person who made the proof 
  has the same public-private key pair. It helps us check if the same 
  person who made the proof is using it. Not some other person.

  Ideally, we'd include a way to verify the identity of the person who created
  the proof, but it's really difficult to do that anonymously and reliably ATM. 
  The method described above is a simpler version of achieving that.

*/
export const generateSignatureUsingDefaultKeys = (fieldsArray) => {
  /*
    Default private and public keys that users can use to skip this step
    and not sign the data themselves - proof consumer will see that the
    user did not provide his own signature and instead used the default.

    Default keys:
    {
      "privateKey": "EKFFPMTjJivav7xxEdXyCVKs5KedZsZaQWSWXkXdM4UjeH54rJV4",
      "publicKey": "B62qqFJyFDcPNuuoV2Af8nWGib7tE9MjBCJ2MEPDVMVM71iwGcjR6RH"
    }
  */
  const privateKey = 'EKFFPMTjJivav7xxEdXyCVKs5KedZsZaQWSWXkXdM4UjeH54rJV4'
  const creatorPrivateKey = PrivateKey.fromBase58(privateKey);
  const creatorPublicKey = creatorPrivateKey.toPublicKey();
  const creatorDataSignature = Signature.create(
    creatorPrivateKey,
    fieldsArray
  )
  return [creatorPublicKey, creatorDataSignature]
}