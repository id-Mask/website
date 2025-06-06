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


const generateSignatureUsingDefaultKeys = (fieldsArray, privateKey) => {
  /*
    Default private and public keys that users can use to skip this step
    and not sign the data themselves - proof consumer will see that the
    user did not provide his own signature and instead used the default.
  */
  const creatorPrivateKey = PrivateKey.fromBase58(privateKey);
  const creatorPublicKey = creatorPrivateKey.toPublicKey();
  const creatorDataSignature = Signature.create(
    creatorPrivateKey,
    fieldsArray
  );
  return {
    publicKey: creatorPublicKey.toBase58(),
    signature: creatorDataSignature.toJSON(),
  }
}

const generateSignatureUsingAuroWallet = async (fieldsArray) => {
  /*
    Instead of using the default public private keys, generate the 
    signature by asking the user to sign it using Auro wallet and
    user's own publick and private key pair.
  */
  // const _ = await window.mina.request({ method: 'mina_accounts' });  // auro wallet
  const _ = await window.mina.requestAccounts();  // auro wallet
  const stringsArray = fieldsArray.map(field => field.toString());
  const signedData = await window.mina.signFields({
    message: stringsArray
  });
  return {
    publicKey: signedData.publicKey,
    signature: signedData.signature
  }
}

/*
  For convenience, wrap around both functions above and create a single
  entry function to be called to collect either a default signature or  
  proper signature created by the user using Auro wallet.
*/
export const generateCreatorAccountSignature = async (fieldsArray, userSignatureOptions) => {
  const useAuroWallet = userSignatureOptions.requestUserWalletSignature
  if (useAuroWallet) {
    return await generateSignatureUsingAuroWallet(fieldsArray)
  } else {
    return generateSignatureUsingDefaultKeys(
      fieldsArray, 
      userSignatureOptions.defaultKeyPair.privateKey
    )
  }
}


/*
  Check if browser has a wallet display message if not
*/
export const isWalletAvailable = async () => {
  return await window.mina ? true : false
}
