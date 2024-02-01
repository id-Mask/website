var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Signature, Bool, SmartContract, Permissions, Struct, ZkProgram, } from 'o1js';
import { verifyOracleData } from './ProofOfSanctions.utils.js';
export class PublicInput extends Struct({
    isMatched: Bool,
    minScore: Field,
    currentDate: Field,
}) {
}
class PublicOutput extends Struct({
    minScore: Field,
    currentDate: Field,
}) {
}
export const proofOfSanctions = ZkProgram({
    name: 'ZkProofOfSanctions',
    publicInput: PublicInput,
    publicOutput: PublicOutput,
    methods: {
        proveSanctions: {
            privateInputs: [
                Signature, // zkOracle data signature
            ],
            method(publicInput, signature) {
                // verity zkOracle data
                const verified = verifyOracleData(publicInput.isMatched, publicInput.minScore, publicInput.currentDate, signature);
                verified.assertTrue();
                // assert that search agains OFAC db yielded no results
                publicInput.isMatched.assertFalse();
                return new PublicOutput({
                    minScore: publicInput.minScore,
                    currentDate: publicInput.currentDate,
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
    verifyProof(proof) {
        // if the proof is invalid, this will fail
        // its impossible to run past this without a valid proof
        proof.verify();
        // the above is enough to be able to check if an address has a proof
        // but there needs to be a way to save the min score that is proved
        // emit an event with min score to be able to query it via archive nodes
        // surely events are not designed for this, but it will do the trick..?
        this.emitEvent('provided-valid-proof', proof.publicOutput);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProofOfSanctionsProof]),
    __metadata("design:returntype", void 0)
], ProofOfSanctions.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfSanctions.js.map