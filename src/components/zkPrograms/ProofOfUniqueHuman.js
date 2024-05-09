var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, Signature, SmartContract, Permissions, Struct, ZkProgram, Poseidon, CircuitString, PublicKey, } from 'o1js';
import { PersonalData } from './ProofOfAge.utils.js';
class PublicOutput extends Struct({
    hash: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
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
                Signature,
                CircuitString,
                Signature,
                Signature,
                PublicKey, // creator wallet public key
            ],
            async method(personalData, personalDataSignature, secretValue, secretValueSignature, creatorSignature, creatorPublicKey) {
                const oraclePuclicKey = PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN');
                // verify data inputs
                const verified = personalDataSignature.verify(oraclePuclicKey, personalData.toFields());
                verified.assertTrue();
                /*
                  Why use SecretValue?
        
                  When the hash of name, surname, and personal identification number is
                  made public (e.g., hash(name, surname, pno)), it poses a privacy risk.
                  Anyone with knowledge of someone's data could potentially track them
                  down by computing the hash. To mitigate this risk, use salt value that
                  is unique to each person. This salt value is provided by the zkOracle.
                  Instead of: hash(name, surname, pno), do: hash(name, surname, pno, secretvalue)
        
                */
                const verified_ = secretValueSignature.verify(oraclePuclicKey, secretValue.values.map((item) => item.toField()));
                verified_.assertTrue();
                // verify creator signature
                const validSignature_ = creatorSignature.verify(creatorPublicKey, personalData.toFields());
                validSignature_.assertTrue();
                // create hash unique to this person
                const hash = Poseidon.hash([
                    ...personalData.name.values.map((item) => item.toField()),
                    ...personalData.surname.values.map((item) => item.toField()),
                    ...personalData.pno.values.map((item) => item.toField()),
                    ...secretValue.values.map((item) => item.toField()),
                ]);
                return new PublicOutput({
                    hash: hash,
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