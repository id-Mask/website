import { Field, Signature, CircuitString, Bool } from 'o1js';
declare const verifyOracleData: (name: CircuitString, surname: CircuitString, country: CircuitString, pno: CircuitString, currentDate: CircuitString, signature: Signature) => Bool;
declare const parseDateFromPNO: (pno: CircuitString) => Field[];
declare const parseDateFromDateString: (currentDate: CircuitString) => Field[];
export { verifyOracleData, parseDateFromPNO, parseDateFromDateString };
