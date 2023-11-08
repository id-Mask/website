var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Experimental, Signature, CircuitString, Bool, SmartContract, Permissions, } from 'o1js';
import { verifyOracleData, parseDateFromPNO, parseDateFromDateString, } from './utils.js';
export const proofOfAge = Experimental.ZkProgram({
    publicInput: Field,
    publicOutput: Bool,
    methods: {
        proveAge: {
            privateInputs: [
                CircuitString,
                CircuitString,
                CircuitString,
                CircuitString,
                CircuitString,
                Signature, // zkOracle data signature
            ],
            method(ageToProveInYears, name, surname, country, pno, currentDate, signature) {
                // verity zkOracle data
                const verified = verifyOracleData(name, surname, country, pno, currentDate, signature);
                verified.assertTrue();
                const [birthYear, birthMonth, birthDay] = parseDateFromPNO(pno);
                const [currentYear, currentMonth, currentDay] = parseDateFromDateString(currentDate);
                // edge case: https://discord.com/channels/484437221055922177/1136989663152840714
                currentYear.greaterThan(birthYear).assertTrue();
                // convert everything to days, so that it is easy to compare two numbers
                // numbers (year, month, day) will be expressed in days, e.g. 2010 = 2010 * 365
                const daysPerYear = Field(365);
                const daysPerMonth = Field(30);
                const birthDateInDays = birthYear
                    .mul(daysPerYear)
                    .add(birthMonth.mul(daysPerMonth))
                    .add(birthDay);
                const currentDateInDays = currentYear
                    .mul(daysPerYear)
                    .add(currentMonth.mul(daysPerMonth))
                    .add(currentDay);
                const ageToProveInDays = ageToProveInYears.mul(daysPerYear);
                // verify that (current date - age to prove) > date of birth
                const olderThanAgeToProve = currentDateInDays
                    .sub(ageToProveInDays)
                    .greaterThan(birthDateInDays);
                olderThanAgeToProve.assertTrue();
                return olderThanAgeToProve;
            },
        },
    },
});
/*
Use the zkPragram defined above to create an on-chain smart contract that
consume the proof created by the program above and thus 'put' the proof on chain
*/
export class ProofOfAgeProof extends Experimental.ZkProgram.Proof(proofOfAge) {
}
export class ProofOfAge extends SmartContract {
    constructor() {
        super(...arguments);
        this.events = {
            'provided-valid-proof-with-age': Field,
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
        this.emitEvent('provided-valid-proof-with-age', proof.publicInput);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProofOfAgeProof]),
    __metadata("design:returntype", void 0)
], ProofOfAge.prototype, "verifyProof", null);
//# sourceMappingURL=ProofOfAge.js.map