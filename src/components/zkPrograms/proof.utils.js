import { Field, PublicKey, Signature, CircuitString, Struct, createForeignCurve, createEcdsa, Crypto, PrivateKey, } from 'o1js';
export class Secp256r1 extends createForeignCurve(Crypto.CurveParams.Secp256r1) {
}
export class EcdsaP256 extends createEcdsa(Secp256r1) {
}
export class PassKeys extends Struct({
    id: Field,
    publicKey: Secp256r1,
    payload: Secp256r1.Scalar,
    signature: EcdsaP256,
}) {
    constructor(data) {
        super({
            id: Field(encodeToAsciiNumber(data.id)),
            publicKey: Secp256r1.fromHex(data.publicKey),
            payload: Secp256r1.Scalar.from(data.payload),
            signature: EcdsaP256.fromHex(data.signature),
        });
    }
    toJSON() {
        return {
            id: decodeFromAsciiNumber(this.id.toBigInt()),
            publicKey: toPublicKeyHex(this.publicKey.x.toBigInt(), this.publicKey.y.toBigInt()),
            payload: '0x' + this.payload.toBigInt().toString(16),
            signature: toPublicKeyHex(this.signature.r.toBigInt(), this.signature.s.toBigInt()).replace(/^0x04/, '0x'),
        };
    }
}
export class PersonalData extends Struct({
    name: CircuitString,
    surname: CircuitString,
    country: CircuitString,
    pno: CircuitString,
    currentDate: Field,
    isMockData: Field,
    signature: Signature,
    publicKey: PublicKey,
}) {
    constructor(data) {
        super({
            name: CircuitString.fromString(data.name),
            surname: CircuitString.fromString(data.surname),
            country: CircuitString.fromString(data.country),
            pno: CircuitString.fromString(data.pno),
            currentDate: Field(data.currentDate),
            isMockData: Field(data.isMockData),
            signature: Signature.fromJSON(data.signature),
            publicKey: PublicKey.fromJSON(data.publicKey),
        });
    }
    toJSON() {
        return {
            name: this.name.toString(),
            surname: this.surname.toString(),
            country: this.country.toString(),
            pno: this.pno.toString(),
            currentDate: Number(this.currentDate.toBigInt()),
            isMockData: Number(this.isMockData.toBigInt()),
            signature: this.signature.toJSON(),
            publicKey: this.publicKey.toBase58(),
        };
    }
    toFields() {
        return [
            ...this.name.values.map((item) => item.toField()),
            ...this.surname.values.map((item) => item.toField()),
            ...this.country.values.map((item) => item.toField()),
            ...this.pno.values.map((item) => item.toField()),
            this.currentDate,
            this.isMockData,
        ];
    }
}
export class CreatorAccount extends Struct({
    publicKey: PublicKey,
    signature: Signature,
}) {
    constructor(data) {
        super({
            publicKey: PublicKey.fromJSON(data.publicKey),
            signature: Signature.fromJSON(data.signature),
        });
    }
    toJSON() {
        return {
            publicKey: this.publicKey.toBase58(),
            signature: this.signature.toJSON(),
        };
    }
}
export const creatorAccountResponseMock = (fieldArray) => {
    const creatorPrivateKey = PrivateKey.random();
    const creatorPublicKey = creatorPrivateKey.toPublicKey();
    const creatorDataSignature = Signature.create(creatorPrivateKey, fieldArray);
    return {
        publicKey: creatorPublicKey.toBase58(),
        signature: creatorDataSignature.toJSON(),
    };
};
export const personalDataResponseMock = () => {
    return {
        name: 'Hilary',
        surname: 'Ouse',
        country: 'EE',
        pno: 'PNOLT-41111117143',
        currentDate: 20231024,
        isMockData: 1,
        signature: {
            r: '1555738747717651780478288099752602555559880124819062656060465821464020291069',
            s: '22752634323814692994123893217485761039113123781541011317453581832502889787070',
        },
        publicKey: 'B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN',
    };
};
export const passKeysResponseMock = () => {
    return {
        id: 'qaJp7BwUkIObDyRE5o_xNg',
        publicKey: '0x04f233d2c2db88ea7c936939cea21f22f1d308d3f527969f5e73ef49b47245d80c8abc0824030a31ee43dfba8419e5044f1f9e82d4e72d73b847b8ffd5f606d0a8',
        payload: '0xecaa80f4b8f73bec3100e49e601a9ffbf194d4d6b1610701aafdcc390a4ca953',
        signature: '0x708330e4d634d1446cd955272c514c9a2a963e5cb1bffc5185fd404f7a6ad794274c91e52ebfa9331ce79a558ec7477a38bf43c19463fc034a022311234fa840',
    };
};
export const encodeToAsciiNumber = (str) => {
    return BigInt(str
        .split('')
        .map((char) => char.charCodeAt(0))
        .join(''));
};
// Convert concatenated ASCII values back to string
export const decodeFromAsciiNumber = (num) => {
    const strNum = num.toString();
    const result = [];
    let i = 0;
    while (i < strNum.length) {
        // Try 3-digit ASCII first (for values >= 100)
        if (i + 2 < strNum.length) {
            const asciiVal = parseInt(strNum.slice(i, i + 3));
            if (asciiVal <= 127) {
                // Valid ASCII range
                result.push(String.fromCharCode(asciiVal));
                i += 3;
                continue;
            }
        }
        // Try 2-digit ASCII
        if (i + 1 < strNum.length) {
            const asciiVal = parseInt(strNum.slice(i, i + 2));
            if (asciiVal <= 127) {
                result.push(String.fromCharCode(asciiVal));
                i += 2;
                continue;
            }
        }
        // Single digit
        const asciiVal = parseInt(strNum[i]);
        result.push(String.fromCharCode(asciiVal));
        i += 1;
    }
    return result.join('');
};
export const toPublicKeyHex = (x, y) => {
    /*
    Example usage:
  
    import { Crypto, createForeignCurve } from 'o1js';
  
    class Secp256r1 extends createForeignCurve(Crypto.CurveParams.Secp256r1) {}
  
    const publicKeyHex =
      '0x04f233d2c2db88ea7c936939cea21f22f1d308d3f527969f5e73ef49b47245d80c8abc0824030a31ee43dfba8419e5044f1f9e82d4e72d73b847b8ffd5f606d0a8';
    const publicKey = Secp256r1.fromHex(publicKeyHex);
  
    const publicKeyHex_ = toPublicKeyHex(
      publicKey.toBigint().x,
      publicKey.toBigint().y
    );
  
  */
    return ('0x04' + x.toString(16).padStart(64, '0') + y.toString(16).padStart(64, '0'));
};
export const bigintToHex = (bn, length = 32) => {
    return bn.toString(16).padStart(length * 2, '0');
};
//# sourceMappingURL=proof.utils.js.map