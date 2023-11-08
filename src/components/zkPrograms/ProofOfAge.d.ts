import { Signature, SmartContract } from 'o1js';
export declare const proofOfAge: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: import("o1js/dist/node/lib/proof_system.js").Proof<import("o1js/dist/node/lib/field.js").Field, import("o1js/dist/node/lib/bool.js").Bool>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky.js").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: typeof import("o1js/dist/node/lib/field.js").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field.js").Field | import("o1js/dist/node/lib/field.js").FieldVar | import("o1js/dist/node/lib/field.js").FieldConst) => import("o1js/dist/node/lib/field.js").Field);
    publicOutputType: typeof import("o1js/dist/node/lib/bool.js").Bool & ((x: boolean | import("o1js/dist/node/lib/bool.js").Bool | import("o1js/dist/node/lib/field.js").FieldVar) => import("o1js/dist/node/lib/bool.js").Bool);
} & {
    proveAge: (publicInput: import("o1js/dist/node/lib/field.js").Field, ...args: [any, any, any, any, any, Signature] & any[]) => Promise<import("o1js/dist/node/lib/proof_system.js").Proof<import("o1js/dist/node/lib/field.js").Field, import("o1js/dist/node/lib/bool.js").Bool>>;
};
declare const ProofOfAgeProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: import("o1js/dist/node/lib/field.js").Field;
        publicOutput: import("o1js/dist/node/lib/bool.js").Bool;
        maxProofsVerified: 0 | 2 | 1;
    }): {
        publicInput: import("o1js/dist/node/lib/field.js").Field;
        publicOutput: import("o1js/dist/node/lib/bool.js").Bool;
        proof: unknown;
        maxProofsVerified: 0 | 2 | 1;
        shouldVerify: import("o1js/dist/node/lib/bool.js").Bool;
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/bool.js").Bool): void;
        toJSON(): import("o1js/dist/node/lib/proof_system.js").JsonProof;
    };
    publicInputType: typeof import("o1js/dist/node/lib/field.js").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field.js").Field | import("o1js/dist/node/lib/field.js").FieldVar | import("o1js/dist/node/lib/field.js").FieldConst) => import("o1js/dist/node/lib/field.js").Field);
    publicOutputType: typeof import("o1js/dist/node/lib/bool.js").Bool & ((x: boolean | import("o1js/dist/node/lib/bool.js").Bool | import("o1js/dist/node/lib/field.js").FieldVar) => import("o1js/dist/node/lib/bool.js").Bool);
    tag: () => {
        name: string;
        publicInputType: typeof import("o1js/dist/node/lib/field.js").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field.js").Field | import("o1js/dist/node/lib/field.js").FieldVar | import("o1js/dist/node/lib/field.js").FieldConst) => import("o1js/dist/node/lib/field.js").Field);
        publicOutputType: typeof import("o1js/dist/node/lib/bool.js").Bool & ((x: boolean | import("o1js/dist/node/lib/bool.js").Bool | import("o1js/dist/node/lib/field.js").FieldVar) => import("o1js/dist/node/lib/bool.js").Bool);
    };
    fromJSON<S extends (new (...args: any) => import("o1js/dist/node/lib/proof_system.js").Proof<unknown, unknown>) & {
        prototype: import("o1js/dist/node/lib/proof_system.js").Proof<any, any>;
        publicInputType: import("o1js/dist/node/lib/circuit_value.js").FlexibleProvablePure<any>;
        publicOutputType: import("o1js/dist/node/lib/circuit_value.js").FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
        fromJSON: typeof import("o1js/dist/node/lib/proof_system.js").Proof.fromJSON;
    } & {
        prototype: import("o1js/dist/node/lib/proof_system.js").Proof<unknown, unknown>;
    }>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("o1js/dist/node/lib/proof_system.js").JsonProof): import("o1js/dist/node/lib/proof_system.js").Proof<import("o1js/dist/node/bindings/lib/provable-snarky.js").InferProvable<S["publicInputType"]>, import("o1js/dist/node/bindings/lib/provable-snarky.js").InferProvable<S["publicOutputType"]>>;
};
export declare class ProofOfAgeProof extends ProofOfAgeProof_base {
}
export declare class ProofOfAge extends SmartContract {
    events: {
        'provided-valid-proof-with-age': typeof import("o1js/dist/node/lib/field.js").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field.js").Field | import("o1js/dist/node/lib/field.js").FieldVar | import("o1js/dist/node/lib/field.js").FieldConst) => import("o1js/dist/node/lib/field.js").Field);
    };
    init(): void;
    verifyProof(proof: ProofOfAgeProof): void;
}
export {};
