import { Field, PrivateKey, PublicKey, Signature, Bool, Struct } from 'o1js';
export class SanctionsData extends Struct({
    isMatched: Bool,
    minScore: Field,
    currentDate: Field,
    signature: Signature,
    publicKey: PublicKey,
}) {
    constructor(data) {
        super({
            isMatched: Bool(data.isMatched),
            minScore: Field(data.minScore),
            currentDate: Field(data.currentDate),
            signature: Signature.fromJSON(data.signature),
            publicKey: PublicKey.fromJSON(data.publicKey),
        });
    }
    toJSON() {
        return {
            isMatched: this.isMatched.toBoolean(),
            minScore: Number(this.minScore.toBigInt()),
            currentDate: Number(this.currentDate.toBigInt()),
            signature: this.signature.toJSON(),
            publicKey: this.publicKey.toBase58(),
        };
    }
    toFields() {
        return [this.isMatched.toField(), this.minScore, this.currentDate];
    }
}
const sanctionsDataResponseMock = ({ isMatched }) => {
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
        isMatched: data.isMatched,
        minScore: data.minScore,
        currentDate: data.currentDate,
        signature: signature.toJSON(),
        publicKey: publicKey.toBase58(),
    };
};
export { sanctionsDataResponseMock };
//# sourceMappingURL=ProofOfSanctions.utils.js.map