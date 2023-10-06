var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Experimental, Signature, CircuitString, Bool, SmartContract, State, state, } from 'o1js';
import { verifyOracleData, parseUnixTimestampFromPNO } from './utils.js';
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
                Field,
                Signature, // zkOracle data signature
            ],
            method(ageToProveInYears, name, surname, country, pno, timestamp, signature) {
                // verity zkOracle data
                const verified = verifyOracleData(name, surname, country, pno, timestamp, signature);
                verified.assertTrue();
                // verify that (current time - age to prove) > date of birth
                const secondsPerYear = Field(31536000); // 365 * 24 * 60 * 60;
                const dateOfBirthUnixTimestamp = parseUnixTimestampFromPNO(pno);
                // edge case: https://discord.com/channels/484437221055922177/1136989663152840714
                timestamp
                    .greaterThan(ageToProveInYears.mul(secondsPerYear))
                    .assertTrue();
                const olderThanAgeToProve = timestamp
                    .sub(ageToProveInYears.mul(secondsPerYear))
                    .greaterThan(dateOfBirthUnixTimestamp);
                olderThanAgeToProve.assertTrue();
                return olderThanAgeToProve;
            },
        },
    },
});
export class ProofOfAge extends SmartContract {
    constructor() {
        super(...arguments);
        this.num = State();
    }
    init() {
        super.init();
        this.num.set(Field(1));
    }
    proveAge() {
        // proof.verify().assertTrue();
        const currentState = this.num.getAndAssertEquals();
        const newState = currentState.add(1);
        this.num.set(newState);
    }
}
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ProofOfAge.prototype, "num", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProofOfAge.prototype, "proveAge", null);
//# sourceMappingURL=ProofOfAge.js.map