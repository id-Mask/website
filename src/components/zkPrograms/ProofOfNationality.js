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
import { PersonalData } from './ProofOfAge.utils.js';
class PublicOutput extends Struct({
    nationality: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
}) {
}
export const proofOfNationality = ZkProgram({
    name: 'ZkProofOfNationality',
    publicInput: undefined,
    publicOutput: PublicOutput,
    methods: {
        proveNationality: {
            privateInputs: [
                PersonalData,
                Signature,
                Signature,
                PublicKey, // creator wallet public key
            ],
            async method(personalData, signature, creatorSignature, creatorPublicKey) {
                // verify zkOracle data
                const oraclePuclicKey = PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN');
                const validSignature = signature.verify(oraclePuclicKey, personalData.toFields());
                validSignature.assertTrue();
                // verify creator signature
                const validSignature_ = creatorSignature.verify(creatorPublicKey, personalData.toFields());
                validSignature_.assertTrue();
                /*
                  Nationality is expressed as a single Field element which can be mapped
                  back to 2 letter country code: https://asecuritysite.com/coding/asc2
                  see utils file for details
                */
                const firstChar = personalData.country.values[0].value;
                const secondChar = personalData.country.values[1].value;
                const nationality = firstChar.mul(100).add(secondChar);
                return new PublicOutput({
                    nationality: nationality,
                    currentDate: personalData.currentDate,
                    creatorPublicKey: creatorPublicKey,
                });
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