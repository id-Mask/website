var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, SmartContract, Permissions, Struct, ZkProgram, Poseidon, PublicKey, } from 'o1js';
import { PersonalData, PassKeys, Secp256r1, CreatorAccount, } from './proof.utils.js';
import { PersonalSecretValue } from './ProofOfUniqueHuman.utils.js';
class PublicOutput extends Struct({
    hash: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
    passkeysPublicKey: Secp256r1,
    passkeysId: Field,
    isMockData: Field,
}) {
}
export const proofOfUniqueHuman = ZkProgram({
    name: 'ZkProofOfUniqueHuman',
    publicInput: undefined,
    publicOutput: PublicOutput,
    methods: {
        proveUniqueHuman: {
            privateInputs: [
                PersonalData,
                PersonalSecretValue, // unique secret value
                CreatorAccount,
                PassKeys, // passkeys params
            ],
            async method(personalData, personalSecretValue, creatorAccount, PassKeys) {
                const oraclePublicKey = PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN');
                // verify data inputs
                const validSignatureOracle = personalData.signature.verify(oraclePublicKey, personalData.toFields());
                validSignatureOracle.assertTrue();
                /*
                  Why use SecretValue?
        
                  When the hash of name, surname, and personal identification number is
                  made public (e.g., hash(name, surname, pno)), it poses a privacy risk.
                  Anyone with knowledge of someone's data could potentially track them
                  down by computing the hash. To mitigate this risk, use salt value that
                  is unique to each person. This salt value is provided by the zkOracle.
                  Instead of: hash(name, surname, pno), do: hash(name, surname, pno, secretvalue)
        
                */
                const validSecretValue = personalSecretValue.signature.verify(oraclePublicKey, personalSecretValue.toFields());
                validSecretValue.assertTrue();
                // verify creator signature
                const validSignatureWallet = creatorAccount.signature.verify(creatorAccount.publicKey, personalData.toFields());
                validSignatureWallet.assertTrue();
                // verify passkeys signature
                const validSignaturePassKeys = PassKeys.signature.verifySignedHash(PassKeys.payload, PassKeys.publicKey);
                validSignaturePassKeys.assertTrue();
                /*
                  Use personal number (pno) and secret value for the hash, not name or surname:
                  - Names and surnames can change (e.g., marriage, legal name change), so they're unreliable identifiers.
                  - Personal numbers are immutable and unique, making them stable identifiers.
                */
                const hash = Poseidon.hash([
                    // ...personalData.name.values.map((item) => item.toField()),
                    // ...personalData.surname.values.map((item) => item.toField()),
                    ...personalData.pno.values.map((item) => item.toField()),
                    ...personalSecretValue.toFields(),
                ]);
                return {
                    publicOutput: {
                        hash: hash,
                        currentDate: personalData.currentDate,
                        creatorPublicKey: creatorAccount.publicKey,
                        passkeysPublicKey: PassKeys.publicKey,
                        passkeysId: PassKeys.id,
                        isMockData: personalData.isMockData,
                    },
                };
            },
        },
    },
});
/*
Use the zkPragram defined above to create an on-chain smart contract that
consume the proof created by the program above and thus 'put' the proof on chain
*/
export class ProofOfUniqueHumanProof extends ZkProgram.Proof(proofOfUniqueHuman) {
}
export class ProofOfUniqueHuman extends SmartContract {
    constructor() {
        super(...arguments);
        this.events = {
            'provided-valid-proof': PublicOutput,
        };
    }
    init() {
        super.init();
        // https://docs.minaprotocol.com/zkapps/o1js/permissions#types-of-permissions
        this.account.permissions.set({
            ...Permissions.default(),
        });
    }
    async verifyProof(proof) {
        proof.verify();
        this.emitEvent('provided-valid-proof', proof.publicOutput);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProofOfUniqueHumanProof]),
    __metadata("design:returntype", Promise)
], ProofOfUniqueHuman.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfUniqueHuman.js.map