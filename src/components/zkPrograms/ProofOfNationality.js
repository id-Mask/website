var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Signature, SmartContract, Permissions, PublicKey, Struct, ZkProgram, } from 'o1js';
import { PersonalData, PassKeysParams, Secp256r1 } from './proof.utils.js';
class PublicOutput extends Struct({
    nationality: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
    passkeysPublicKey: Secp256r1,
    passkeysId: Field,
    isMockData: Field,
}) {
}
export const proofOfNationality = ZkProgram({
    name: 'ZkProofOfNationality',
    publicInput: undefined,
    publicOutput: PublicOutput, // defined above
    methods: {
        proveNationality: {
            privateInputs: [
                PersonalData,
                Signature, // zkOracle data signature
                Signature, // creator wallet signature
                PublicKey, // creator wallet public key
                PassKeysParams, // passkeys params
            ],
            async method(personalData, signature, creatorSignature, creatorPublicKey, PassKeysParams) {
                // verify zkOracle data
                const validSignatureOracle = signature.verify(PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'), personalData.toFields());
                validSignatureOracle.assertTrue();
                // verify creator signature
                const validSignatureWallet = creatorSignature.verify(creatorPublicKey, personalData.toFields());
                validSignatureWallet.assertTrue();
                // verify passkeys signature
                const validSignaturePassKeys = PassKeysParams.signature.verifySignedHash(PassKeysParams.payload, PassKeysParams.publicKey);
                validSignaturePassKeys.assertTrue();
                /*
                  Nationality is expressed as a single Field element which can be mapped
                  back to 2 letter country code: https://asecuritysite.com/coding/asc2
                  see utils file for details
                */
                const firstChar = personalData.country.values[0].value;
                const secondChar = personalData.country.values[1].value;
                const nationality = firstChar.mul(100).add(secondChar);
                return {
                    publicOutput: {
                        nationality: nationality,
                        currentDate: personalData.currentDate,
                        creatorPublicKey: creatorPublicKey,
                        passkeysPublicKey: PassKeysParams.publicKey,
                        passkeysId: PassKeysParams.id,
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
export class ProofOfNationalityProof extends ZkProgram.Proof(proofOfNationality) {
}
export class ProofOfNationality extends SmartContract {
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
    __metadata("design:paramtypes", [ProofOfNationalityProof]),
    __metadata("design:returntype", Promise)
], ProofOfNationality.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfNationality.js.map