import { Field, Signature, CircuitString, Bool } from 'o1js';
declare const verifyOracleData: (name: CircuitString, surname: CircuitString, country: CircuitString, pno: CircuitString, timestamp: Field, signature: Signature) => Bool;
declare const parseUnixTimestampFromPNO: (pno: CircuitString) => import("o1js/dist/node/lib/field").Field;
export { verifyOracleData, parseUnixTimestampFromPNO };
