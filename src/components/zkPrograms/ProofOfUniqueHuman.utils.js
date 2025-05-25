import { CircuitString, PrivateKey, Signature, Struct, PublicKey, } from 'o1js';
export class PersonalSecretValue extends Struct({
    secret: CircuitString,
    signature: Signature,
    publicKey: PublicKey,
}) {
    constructor(data) {
        super({
            secret: CircuitString.fromString(data.secret),
            signature: Signature.fromJSON(data.signature),
            publicKey: PublicKey.fromJSON(data.publicKey),
        });
    }
    toJSON() {
        return {
            secret: this.secret.toString(),
            signature: this.signature.toJSON(),
            publicKey: this.publicKey.toBase58(),
        };
    }
    toFields() {
        return [...this.secret.values.map((item) => item.toField())];
    }
}
const getMockPersonalSecretValue = () => {
    const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY;
    const privateKey = PrivateKey.fromBase58(TESTING_PRIVATE_KEY);
    const publicKey = privateKey.toPublicKey();
    const secret = '123abc';
    const secret_ = CircuitString.fromString('123abc');
    const signature = Signature.create(privateKey, secret_.values.map((item) => item.toField()));
    return {
        secret: secret,
        signature: signature.toJSON(),
        publicKey: publicKey.toBase58(),
    };
};
export { getMockPersonalSecretValue };
//# sourceMappingURL=ProofOfUniqueHuman.utils.js.map