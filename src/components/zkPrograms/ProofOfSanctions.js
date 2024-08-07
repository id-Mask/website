var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Signature, Bool, SmartContract, Permissions, Struct, ZkProgram, PublicKey, } from 'o1js';
import { verifyOracleData } from './ProofOfSanctions.utils.js';
export class PublicInput extends Struct({
    isMatched: Bool,
    minScore: Field,
    currentDate: Field,
}) {
    toFields() {
        return [this.isMatched.toField(), this.minScore, this.currentDate];
    }
}
class PublicOutput extends Struct({
    minScore: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
}) {
}
export const proofOfSanctions = ZkProgram({
    name: 'ZkProofOfSanctions',
    publicInput: PublicInput,
    publicOutput: PublicOutput,
    methods: {
        proveSanctions: {
            privateInputs: [
                Signature,
                Signature,
                PublicKey, // creator wallet public key
            ],
            async method(publicInput, signature, creatorSignature, creatorPublicKey) {
                // verity zkOracle data
                const verified = verifyOracleData(publicInput.isMatched, publicInput.minScore, publicInput.currentDate, signature);
                verified.assertTrue();
                // verify creator signature
                const validSignature_ = creatorSignature.verify(creatorPublicKey, publicInput.toFields());
                validSignature_.assertTrue();
                // assert that search agains OFAC db yielded no results
                publicInput.isMatched.assertFalse();
                return new PublicOutput({
                    minScore: publicInput.minScore,
                    currentDate: publicInput.currentDate,
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
export class ProofOfSanctionsProof extends ZkProgram.Proof(proofOfSanctions) {
}
export class ProofOfSanctions extends SmartContract {
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
    __metadata("design:paramtypes", [ProofOfSanctionsProof]),
    __metadata("design:returntype", Promise)
], ProofOfSanctions.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfSanctions.js.map