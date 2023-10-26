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