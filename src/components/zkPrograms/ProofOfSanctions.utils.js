import { Field, PrivateKey, Signature, Bool } from 'o1js';
const zkOracleSanctionsDataResponseMock = (isMatched) => {
    const data = {
        isMatched: isMatched,
        minScore: 95,
        currentDate: 20231116,
    };
    const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY;
    const privateKey = PrivateKey.fromBase58(TESTING_PRIVATE_KEY);
    const publicKey = privateKey.toPublicKey();
    const dataToSign = [
        Bool(data.isMatched).toField(),
        Field(data.minScore),
        Field(data.currentDate),
    ];
    const signature = Signature.create(privateKey, dataToSign);
    return {
        data: data,
        signature: signature.toJSON(),
        publicKey: publicKey.toBase58(),
    };
};
export { zkOracleSanctionsDataResponseMock };
//# sourceMappingURL=ProofOfSanctions.utils.js.map