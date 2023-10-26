import { Proof, Signature, SmartContract, State } from 'o1js';
export declare const proofOfAge: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: Proof<import("o1js/dist/node/lib/field.js").Field, import("o1js/dist/node/lib/bool.js").Bool>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky.js").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: typeof import("o1js/dist/node/lib/field.js").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field.js").Field | Uint8Array | import("o1js/dist/node/lib/field.js").FieldVar) => import("o1js/dist/node/lib/field.js").Field);
    publicOutputType: typeof import("o1js/dist/node/lib/bool.js").Bool & ((x: boolean | import("o1js/dist/node/lib/bool.js").Bool | import("o1js/dist/node/lib/field.js").FieldVar) => import("o1js/dist/node/lib/bool.js").Bool);
} & {
    proveAge: (publicInput: import("o1js/dist/node/lib/field.js").Field, ...args: [any, any, any, any, any, Signature] & any[]) => Promise<Proof<import("o1js/dist/node/lib/field.js").Field, import("o1js/dist/node/lib/bool.js").Bool>>;
};
export declare class ProofOfAge extends SmartContract {
    num: State<import("o1js/dist/node/lib/field.js").Field>;
    init(): void;
    proveAge(): void;
}
