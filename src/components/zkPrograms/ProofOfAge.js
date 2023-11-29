var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Signature, Bool, SmartContract, Permissions, PublicKey, Struct, ZkProgram, } from 'o1js';
import { PersonalData, parseDateFromPNO } from './ProofOfAge.utils.js';
class PublicOutput extends Struct({
    olderThanAgeToProve: Bool,
    currentDate: Field,
}) {
}
export const proofOfAge = ZkProgram({
    name: 'ZkProofOfAge',
    publicInput: Field,
    publicOutput: PublicOutput,
    methods: {
        proveAge: {
            privateInputs: [
                PersonalData,
                Signature, // zkOracle data signature
            ],
            method(ageToProveInYears, personalData, signature) {
                // verify zkOracle data
                const oraclePuclicKey = PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN');
                const validSignature = signature.verify(oraclePuclicKey, personalData.toFields());
                validSignature.assertTrue();
                // parse date of birth from pno
                const dateOfBirth = parseDateFromPNO(personalData.pno);
                // edge case: https://discord.com/channels/484437221055922177/1136989663152840714
                personalData.currentDate.greaterThan(dateOfBirth).assertTrue();
                // verify that (current date - age to prove) > date of birth
                const olderThanAgeToProve = personalData.currentDate
                    .sub(ageToProveInYears.mul(Field(10000)))
                    .greaterThan(dateOfBirth);
                olderThanAgeToProve.assertTrue();
                return new PublicOutput({
                    olderThanAgeToProve: olderThanAgeToProve,
                    currentDate: personalData.currentDate,
                });
            },
        },
    },
});
/*
Use the zkPragram defined above to create an on-chain smart contract that
consume the proof created by the program above and thus 'put' the proof on chain
*/
export class ProofOfAgeProof extends ZkProgram.Proof(proofOfAge) {
}
export class ProofOfAge extends SmartContract {
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
        // its impossible to run past this withought a valid proof
        proof.verify();
        // the above is enough to be able to check if an address has a proof
        // but there needs to be a way to save the number of years that are proved
        // emit an event with number of years to be able to query it via archive nodes
        // surely events are not designed for this, but it will do the trick..?
        this.emitEvent('provided-valid-proof', proof.publicOutput);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProofOfAgeProof]),
    __metadata("design:returntype", void 0)
], ProofOfAge.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfAge.js.map