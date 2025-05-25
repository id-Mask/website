var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, method, SmartContract, Permissions, Struct, ZkProgram, PublicKey, } from 'o1js';
import { PersonalData, PassKeys, CreatorAccount, Secp256r1, } from './proof.utils.js';
import { SanctionsData } from './ProofOfSanctions.utils.js';
class PublicOutput extends Struct({
    minScore: Field,
    currentDate: Field,
    creatorPublicKey: PublicKey,
    passkeysPublicKey: Secp256r1,
    passkeysId: Field,
    isMockData: Field,
}) {
}
export const proofOfSanctions = ZkProgram({
    name: 'ZkProofOfSanctions',
    publicInput: SanctionsData,
    publicOutput: PublicOutput, // defined above
    methods: {
        proveSanctions: {
            privateInputs: [
                PersonalData,
                CreatorAccount,
                PassKeys, // passkeys params
            ],
            async method(sanctionsData, personalData, creatorAccount, PassKeys) {
                // verify personalData
                const validSignatureOracle = personalData.signature.verify(PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'), personalData.toFields());
                validSignatureOracle.assertTrue();
                // verify sanctionsData
                const validSignatureSanctionsData = sanctionsData.signature.verify(PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'), sanctionsData.toFields());
                validSignatureSanctionsData.assertTrue();
                // verify creatorAccount
                const validSignatureWallet = creatorAccount.signature.verify(creatorAccount.publicKey, sanctionsData.toFields());
                validSignatureWallet.assertTrue();
                // verify PassKeys
                const validSignaturePassKeys = PassKeys.signature.verifySignedHash(PassKeys.payload, PassKeys.publicKey);
                validSignaturePassKeys.assertTrue();
                // assert that search agains OFAC db yielded no results
                sanctionsData.isMatched.assertFalse();
                return {
                    publicOutput: {
                        minScore: sanctionsData.minScore,
                        currentDate: sanctionsData.currentDate,
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